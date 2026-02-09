'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { AlertCircle, TrendingUp, Users, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LeaderDashboard() {
    const [stats, setStats] = useState({ today: 0, total: 0 });
    const [dormantClients, setDormantClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

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

        setStats({ today: todayCount || 0, total: totalCount || 0 });
        setDormantClients(clients || []);
        setLoading(false);
    };

    return (
        <div className="space-y-8 pb-20">
            <header>
                <h1 className="text-2xl font-bold">관리자 대시보드</h1>
                <p className="text-gray-500">팀 활동 현황 및 휴면 고객 관리</p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-3xl text-white shadow-lg shadow-blue-200 dark:shadow-none">
                    <TrendingUp className="mb-3 opacity-80" size={24} />
                    <div className="text-3xl font-black">{stats.today}</div>
                    <div className="text-xs font-medium opacity-80">오늘 제출 보고</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <Users className="mb-3 text-primary" size={24} />
                    <div className="text-3xl font-black text-gray-800 dark:text-gray-100">{stats.total}</div>
                    <div className="text-xs font-medium text-gray-500">누적 활동 기록</div>
                </div>
            </div>

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
