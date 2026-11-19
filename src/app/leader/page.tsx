'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { format, subDays, startOfDay, startOfMonth, subMonths, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { AlertCircle, TrendingUp, Users, Calendar, Download, Lock, BarChart3, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';
import { activityOf } from '@/lib/activity';

/** Dormant thresholds offered to the leader (days since the last touch). */
const DORMANT_DAYS = [30, 60, 90] as const;
const DORMANT_PAGE = 50;

/** CSV period choices: [label, start date or null for all time, end date or null for now]. */
const EXPORT_PERIODS = [
    { id: 'today', label: '오늘', range: () => [startOfDay(new Date()), null] as const },
    { id: 'thisMonth', label: '이번 달', range: () => [startOfMonth(new Date()), null] as const },
    { id: 'lastMonth', label: '지난달', range: () => [startOfMonth(subMonths(new Date(), 1)), startOfMonth(new Date())] as const },
    { id: 'last3', label: '최근 3개월', range: () => [startOfMonth(subMonths(new Date(), 2)), null] as const },
    { id: 'all', label: '전체', range: () => [null, null] as const },
] as const;

/** One row of the client_touch_summary view (supabase_features_2026-11.sql). */
type TouchSummary = {
    client_id: string;
    name: string;
    last_visited_at: string;
    report_count: number;
    last_user_id: string | null;
};
type Manager = { id: string; name: string };

/** Quote every CSV field so commas, quotes and line breaks inside names or content stay in one cell. */
const csvCell = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export default function LeaderDashboard() {
    const { profile, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({ today: 0, total: 0 });
    const [summary, setSummary] = useState<TouchSummary[]>([]);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [weeklyStats, setWeeklyStats] = useState<{ date: string; count: number; label: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [dormantDays, setDormantDays] = useState<(typeof DORMANT_DAYS)[number]>(30);
    const [owner, setOwner] = useState<string>('all');
    const [shown, setShown] = useState(DORMANT_PAGE);
    const [exportPeriod, setExportPeriod] = useState<(typeof EXPORT_PERIODS)[number]['id']>('today');
    const [isExporting, setIsExporting] = useState(false);

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        const today = startOfDay(new Date());
        const weekStart = subDays(today, 6);

        const [todayRes, totalRes, summaryRes, weekRes, managersRes] = await Promise.all([
            supabase.from('reports').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
            supabase.from('reports').select('*', { count: 'exact', head: true }),
            supabase.from('client_touch_summary').select('*'),
            supabase.from('reports').select('activity_at').gte('activity_at', weekStart.toISOString()),
            supabase.from('profiles').select('id, name').order('name'),
        ]);

        const dayStats = Array.from({ length: 7 }).map((_, i) => {
            const date = subDays(today, 6 - i);
            const dateStr = format(date, 'yyyy-MM-dd');
            const count = (weekRes.data ?? []).filter((r) => format(new Date(r.activity_at), 'yyyy-MM-dd') === dateStr).length;
            return { date: dateStr, count, label: format(date, 'E', { locale: ko }) };
        });

        setStats({ today: todayRes.count ?? 0, total: totalRes.count ?? 0 });
        setSummary((summaryRes.data ?? []) as TouchSummary[]);
        setManagers(managersRes.data ?? []);
        setWeeklyStats(dayStats);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (!authLoading && profile?.role === 'leader') {
            loadDashboard();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [profile, authLoading, loadDashboard]);

    const managerName = useMemo(() => new Map(managers.map((m) => [m.id, m.name])), [managers]);

    /**
     * Dormant = touched before, but not within the chosen days. The client's last reporter is its
     * owner (no manual assignment). Clients with more past reports — the real accounts — come first.
     */
    const dormant = useMemo(() => {
        const cutoff = subDays(new Date(), dormantDays).getTime();
        return summary
            .filter((s) => new Date(s.last_visited_at).getTime() < cutoff)
            .filter((s) => owner === 'all' || s.last_user_id === owner)
            .sort((a, b) => b.report_count - a.report_count || a.last_visited_at.localeCompare(b.last_visited_at));
    }, [summary, dormantDays, owner]);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const period = EXPORT_PERIODS.find((p) => p.id === exportPeriod)!;
            const [from, to] = period.range();
            let query = supabase
                .from('reports')
                .select('activity_at, type, content, clients (name), profiles (name)')
                .order('activity_at', { ascending: false });
            if (from) query = query.gte('activity_at', from.toISOString());
            if (to) query = query.lt('activity_at', to.toISOString());
            const { data: reports, error } = await query;

            if (error) throw error;
            if (!reports || reports.length === 0) {
                alert('선택한 기간에 다운로드할 데이터가 없습니다.');
                return;
            }

            const headers = ['날짜', '작성자', '고객사', '활동종류', '보고내용'];
            const rows = reports.map((r) => [
                format(new Date(r.activity_at), 'yyyy-MM-dd HH:mm'),
                (r.profiles as unknown as { name: string } | null)?.name || '알수없음',
                (r.clients as unknown as { name: string } | null)?.name || '알수없음',
                activityOf(r.type).label,
                r.content,
            ]);
            const csvContent = '﻿' + [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `영업보고현황_${period.label.replace(/\s/g, '')}_${format(new Date(), 'yyyyMMdd')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            alert('다운로드 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            setIsExporting(false);
        }
    };

    if (authLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
    );

    if (profile?.role !== 'leader') {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-4 px-6 animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-3xl flex items-center justify-center mb-4">
                    <Lock size={40} />
                </div>
                <h1 className="text-2xl font-bold">접근 권한 없음</h1>
                <p className="text-gray-500">이 페이지는 팀장 전용 페이지입니다.<br />권한이 필요하시면 관리자에게 문의하세요.</p>
                <div className="pt-4">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-2xl font-bold active:scale-95 transition-all text-sm"
                    >
                        홈으로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    const maxCount = Math.max(...weeklyStats.map((s) => s.count), 5); // Minimum scale of 5

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-2xl font-bold">관리자 대시보드</h1>
                <p className="text-gray-500">팀 활동 현황 및 휴면 고객 관리</p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-3xl text-white shadow-lg shadow-blue-200 dark:shadow-none relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <TrendingUp size={80} />
                    </div>
                    <div className="relative z-10">
                        <TrendingUp className="mb-3 opacity-80" size={24} />
                        <div className="text-3xl font-black">{stats.today}</div>
                        <div className="text-xs font-medium opacity-80">오늘 제출 보고</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 text-primary group-hover:scale-110 transition-transform">
                        <Users size={80} />
                    </div>
                    <div className="relative z-10">
                        <Users className="mb-3 text-primary" size={24} />
                        <div className="text-3xl font-black text-gray-800 dark:text-gray-100">{stats.total}</div>
                        <div className="text-xs font-medium text-gray-500">누적 활동 기록</div>
                    </div>
                </div>
            </div>

            {/* Export */}
            <section className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold flex items-center">
                        <Download size={16} className="mr-2 text-primary" />
                        엑셀 다운로드
                    </h2>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isExporting ? '받는 중...' : '받기'}
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {EXPORT_PERIODS.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setExportPeriod(p.id)}
                            className={cn(
                                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
                                exportPeriod === p.id ? 'bg-primary/10 text-primary ring-1 ring-primary/30' : 'bg-gray-50 dark:bg-gray-900/50 text-gray-500'
                            )}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </section>

            {/* Weekly Chart */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center mb-6">
                    <BarChart3 size={20} className="mr-2 text-primary" />
                    <h2 className="text-lg font-bold">주간 활동 추이</h2>
                </div>
                <div className="flex items-end justify-between h-40 space-x-3">
                    {weeklyStats.map((stat) => (
                        <div key={stat.date} className="flex flex-col items-center flex-1 group">
                            <div className="relative w-full flex items-end justify-center h-32 bg-gray-50 dark:bg-gray-900 rounded-t-xl overflow-hidden">
                                <div
                                    className="w-full bg-primary/80 group-hover:bg-primary transition-all duration-500 rounded-t-lg mx-1"
                                    style={{ height: `${(stat.count / maxCount) * 100}%` }}
                                >
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded transition-opacity whitespace-nowrap z-10">
                                        {stat.count}건
                                    </div>
                                </div>
                            </div>
                            <div className="text-[10px] text-gray-400 mt-2 font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Dormant Clients Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="flex items-center text-lg font-bold text-red-600 dark:text-red-400">
                        <AlertCircle size={20} className="mr-2" />
                        휴면 고객사
                    </h2>
                    <span className="text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-full">
                        {dormant.length}
                    </span>
                </div>

                <div className="flex gap-2">
                    {DORMANT_DAYS.map((d) => (
                        <button
                            key={d}
                            onClick={() => {
                                setDormantDays(d);
                                setShown(DORMANT_PAGE);
                            }}
                            className={cn(
                                'flex-1 py-2 rounded-xl text-sm font-bold transition-all',
                                dormantDays === d ? 'bg-red-500 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-100 dark:border-gray-700'
                            )}
                        >
                            {d}일+
                        </button>
                    ))}
                </div>

                <div className="relative group">
                    <select
                        value={owner}
                        onChange={(e) => {
                            setOwner(e.target.value);
                            setShown(DORMANT_PAGE);
                        }}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl pl-5 pr-10 py-3 text-sm font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm cursor-pointer"
                    >
                        <option value="all">전체 담당자</option>
                        {managers.map((m) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
                <p className="text-[11px] text-gray-400 px-1">담당자 = 마지막으로 보고를 쓴 사람. 보고가 많았던 거래처가 위에 옵니다.</p>

                {loading ? (
                    <div className="flex justify-center py-10 text-gray-400">데이터 불러오는 중...</div>
                ) : dormant.length > 0 ? (
                    <div className="space-y-3">
                        {dormant.slice(0, shown).map((client) => (
                            <div key={client.client_id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="min-w-0">
                                    <div className="font-bold text-gray-800 dark:text-gray-100 truncate">{client.name}</div>
                                    <div className="text-[10px] text-gray-400 flex items-center mt-1">
                                        <Calendar size={10} className="mr-1 shrink-0" />
                                        마지막 {format(new Date(client.last_visited_at), 'yyyy.MM.dd')} · 보고 {client.report_count}건
                                        {client.last_user_id && managerName.get(client.last_user_id) && ` · ${managerName.get(client.last_user_id)}`}
                                    </div>
                                </div>
                                <div className="text-right shrink-0 ml-3">
                                    <div className="text-xs font-black text-red-500">{differenceInDays(new Date(), new Date(client.last_visited_at))}일 경과</div>
                                    <div className="text-[10px] text-gray-400">터치 필요</div>
                                </div>
                            </div>
                        ))}
                        {dormant.length > shown && (
                            <button
                                onClick={() => setShown((n) => n + DORMANT_PAGE)}
                                className="w-full py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300"
                            >
                                더 보기 ({shown} / {dormant.length})
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-green-50 dark:bg-green-900/10 rounded-3xl text-green-600 text-sm font-medium">
                        관리가 필요한 휴면 고객이 없습니다.
                    </div>
                )}
            </section>
        </div>
    );
}
