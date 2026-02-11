'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format, subDays, startOfDay, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { AlertCircle, TrendingUp, Users, Calendar, Download, Lock, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';

export default function LeaderDashboard() {
    const { profile, loading: authLoading } = useAuth();
    const [stats, setStats] = useState({ today: 0, total: 0 });
    const [dormantClients, setDormantClients] = useState<any[]>([]);
    const [weeklyStats, setWeeklyStats] = useState<{ date: string, count: number, label: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        if (!authLoading && profile?.role === 'leader') {
            loadDashboard();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [profile, authLoading]);

    const loadDashboard = async () => {
        setLoading(true);

        // 1. Get today's report count
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count: todayCount } = await supabase
            .from('reports')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today.toISOString());

        // 2. Get total reports
        const { count: totalCount } = await supabase
            .from('reports')
            .select('*', { count: 'exact', head: true });

        // 3. Get dormant clients (14 days)
        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        const { data: clients } = await supabase
            .from('clients')
            .select('*')
            .or(`last_visited_at.lt.${fourteenDaysAgo.toISOString()},last_visited_at.is.null`)
            .order('last_visited_at', { ascending: true });

        // 4. Get Weekly Stats (Last 7 days)
        const weekStart = subDays(startOfDay(new Date()), 6);
        const { data: weekReports } = await supabase
            .from('reports')
            .select('created_at')
            .gte('created_at', weekStart.toISOString());

        const dayStats = Array.from({ length: 7 }).map((_, i) => {
            const date = subDays(today, 6 - i);
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayReports = weekReports?.filter(r =>
                format(new Date(r.created_at), 'yyyy-MM-dd') === dateStr
            ).length || 0;

            return {
                date: dateStr,
                count: dayReports,
                label: format(date, 'E', { locale: ko }) // Mon, Tue, etc. in Korean
            };
        });

        setStats({ today: todayCount || 0, total: totalCount || 0 });
        setDormantClients(clients || []);
        setWeeklyStats(dayStats);
        setLoading(false);
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const { data: reports, error } = await supabase
                .from('reports')
                .select(`
                    created_at,
                    type,
                    content,
                    clients (name),
                    profiles (name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (!reports || reports.length === 0) {
                alert('다운로드할 데이터가 없습니다.');
                return;
            }

            // CSV Creation
            const headers = ['날짜', '작성자', '고객사', '활동종류', '보고내용'];
            const rows = reports.map(r => [
                format(new Date(r.created_at), 'yyyy-MM-dd HH:mm'),
                (r.profiles as any)?.name || '알수없음',
                (r.clients as any)?.name || '알수없음',
                r.type === 'visit' ? '방문' : r.type === 'phone' ? '전화' : '메일',
                `"${r.content.replace(/"/g, '""')}"` // Escape quotes for CSV
            ]);

            const csvContent = [
                '\uFEFF' + headers.join(','), // BOM for Korean characters
                ...rows.map(row => row.join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `영업보고현황_${format(new Date(), 'yyyyMMdd')}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error: any) {
            alert('다운로드 중 오류가 발생했습니다: ' + error.message);
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

    const maxCount = Math.max(...weeklyStats.map(s => s.count), 5); // Minimum scale of 5

    return (
        <div className="space-y-8 pb-20">
            <header className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold">관리자 대시보드</h1>
                    <p className="text-gray-500">팀 활동 현황 및 휴면 고객 관리</p>
                </div>
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 shadow-sm active:scale-95 transition-all disabled:opacity-50"
                >
                    <Download size={18} />
                    <span>{isExporting ? '받는 중...' : '엑셀 다운로드'}</span>
                </button>
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

            {/* Weekly Chart */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center mb-6">
                    <BarChart3 size={20} className="mr-2 text-primary" />
                    <h2 className="text-lg font-bold">주간 활동 추이</h2>
                </div>
                <div className="flex items-end justify-between h-40 space-x-3">
                    {weeklyStats.map((stat, idx) => (
                        <div key={idx} className="flex flex-col items-center flex-1 group">
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
                        휴면 고객사 (14일+)
                    </h2>
                    <span className="text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-full">
                        {dormantClients.length}
                    </span>
                </div>

                {loading ? (
                    <div className="flex justify-center py-10 text-gray-400">데이터 불러오는 중...</div>
                ) : dormantClients.length > 0 ? (
                    <div className="space-y-3">
                        {dormantClients.map((client) => {
                            const days = client.last_visited_at
                                ? differenceInDays(new Date(), new Date(client.last_visited_at))
                                : '미기록';
                            return (
                                <div key={client.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                    <div>
                                        <div className="font-bold text-gray-800 dark:text-gray-100">{client.name}</div>
                                        <div className="text-[10px] text-gray-400 flex items-center mt-1">
                                            <Calendar size={10} className="mr-1" />
                                            마지막 방문: {client.last_visited_at ? format(new Date(client.last_visited_at), 'yyyy.MM.dd') : '없음'}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-black text-red-500">{days}일 경과</div>
                                        <div className="text-[10px] text-gray-400">터치 필요</div>
                                    </div>
                                </div>
                            );
                        })}
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
