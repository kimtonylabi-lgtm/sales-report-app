'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { FileText, Pencil, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { activityOf } from '@/lib/activity';
import { ReportEditModal } from '@/components/ReportEditModal';

const PAGE_SIZE = 50;

type Report = {
    id: string;
    user_id: string;
    type: string;
    content: string;
    activity_at: string;
    clients: { name: string } | null;
    profiles?: { name: string } | null;
};
type Manager = { id: string; name: string };

export default function MyReportsPage() {
    const { user, profile, loading: authLoading } = useAuth();
    const isLeader = profile?.role === 'leader';
    const [reports, setReports] = useState<Report[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [editingReport, setEditingReport] = useState<Report | null>(null);
    const [managers, setManagers] = useState<Manager[]>([]);
    const [selectedManager, setSelectedManager] = useState<string>('all');

    /** One page of reports, newest activity first. Leaders see everyone (RLS), others only their own. */
    const fetchPage = useCallback(
        async (from: number) => {
            let query = supabase
                .from('reports')
                .select(isLeader ? '*, clients(name), profiles(name)' : '*, clients(name)', { count: 'exact' })
                .order('activity_at', { ascending: false })
                .range(from, from + PAGE_SIZE - 1);
            if (!isLeader && user) query = query.eq('user_id', user.id);
            if (isLeader && selectedManager !== 'all') query = query.eq('user_id', selectedManager);
            const { data, count } = await query;
            return { rows: (data ?? []) as unknown as Report[], count: count ?? 0 };
        },
        [isLeader, user, selectedManager]
    );

    const reload = useCallback(async () => {
        setLoading(true);
        const { rows, count } = await fetchPage(0);
        setReports(rows);
        setTotal(count);
        setLoading(false);
    }, [fetchPage]);

    // Load (and re-load when the person filter changes). The spinner for a filter change is turned on
    // in the select's onChange, so this effect only sets state after the data arrives.
    useEffect(() => {
        if (authLoading || !user) return; // signed-out visitors are redirected by the middleware
        let active = true;
        fetchPage(0).then(({ rows, count }) => {
            if (!active) return;
            setReports(rows);
            setTotal(count);
            setLoading(false);
        });
        return () => {
            active = false;
        };
    }, [authLoading, user, fetchPage]);

    useEffect(() => {
        if (!isLeader) return;
        supabase
            .from('profiles')
            .select('id, name')
            .eq('is_active', true)
            .order('name')
            .then(({ data }) => setManagers(data ?? []));
    }, [isLeader]);

    const loadMore = async () => {
        setLoadingMore(true);
        const { rows } = await fetchPage(reports.length);
        setReports((prev) => [...prev, ...rows]);
        setLoadingMore(false);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                        {isLeader ? '전체 보고 목록' : '내 보고 목록'}
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">
                        {isLeader ? '담당자별 업무 성과를 확인하세요' : '내가 작성한 성과를 확인하세요'}
                    </p>
                </div>
                <div className="text-xs bg-primary/10 text-primary px-4 py-2 rounded-full font-bold">
                    총 {total}건
                </div>
            </header>

            {isLeader && (
                <div className="relative group">
                    <select
                        value={selectedManager}
                        onChange={(e) => {
                            setLoading(true);
                            setSelectedManager(e.target.value);
                        }}
                        className="w-full bg-white dark:bg-gray-800 border-2 border-transparent hover:border-primary/20 rounded-2xl pl-5 pr-10 py-4 text-sm font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm transition-all cursor-pointer"
                    >
                        <option value="all">전체 담당자 보기</option>
                        {managers.map((m) => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors pointer-events-none" size={20} />
                </div>
            )}

            {loading && user ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
                </div>
            ) : reports.length > 0 ? (
                <div className="space-y-4">
                    {reports.map((report, idx) => {
                        const t = activityOf(report.type);
                        const Icon = t.icon;
                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: Math.min(idx % PAGE_SIZE, 10) * 0.05 }}
                                key={report.id}
                                className="group relative bg-white dark:bg-gray-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all"
                            >
                                <button
                                    onClick={() => setEditingReport({ ...report })}
                                    aria-label="보고서 수정"
                                    // Always visible on phones (no hover there); hover-reveal only on desktop.
                                    className="absolute top-5 right-5 p-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 bg-gray-50 dark:bg-gray-700/50 rounded-full text-gray-400 hover:text-primary hover:bg-primary/10 transition-all"
                                >
                                    <Pencil size={16} />
                                </button>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className={cn('p-3 rounded-2xl', t.soft)}>
                                            <Icon size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 pr-10">{report.clients?.name}</h3>
                                            <div className="flex items-center space-x-2 text-xs font-medium text-gray-400 mt-0.5">
                                                <span>{t.label}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                                <span>{format(new Date(report.activity_at), 'MM/dd HH:mm', { locale: ko })}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {isLeader && (
                                        <span className="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg mt-1 mr-10 shrink-0">
                                            {report.profiles?.name}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2 pl-1">{report.content}</p>
                            </motion.div>
                        );
                    })}
                    {reports.length < total && (
                        <button
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="w-full py-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-300 active:scale-[0.99] transition-all disabled:opacity-50"
                        >
                            {loadingMore ? '불러오는 중...' : `더 보기 (${reports.length} / ${total})`}
                        </button>
                    )}
                </div>
            ) : (
                <div className="text-center py-32 space-y-4">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-300">
                        <FileText size={40} className="opacity-50" />
                    </div>
                    <p className="text-gray-400 font-medium">아직 작성한 보고서가 없습니다.</p>
                </div>
            )}

            <ReportEditModal
                report={editingReport && { id: editingReport.id, type: editingReport.type, content: editingReport.content, clientName: editingReport.clients?.name }}
                onClose={() => setEditingReport(null)}
                onDone={() => {
                    setEditingReport(null);
                    reload();
                }}
            />
        </div>
    );
}
