'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ClientSearch } from '@/components/ClientSearch';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { MapPin, Phone, Mail, Clock, ChevronDown, Check, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';
import { motion } from 'framer-motion';

export default function HistoryPage() {
    const { profile } = useAuth();
    const [selectedClient, setSelectedClient] = useState<{ id: string, name: string } | null>(null);
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [todayReports, setTodayReports] = useState<any[]>([]);
    const [managers, setManagers] = useState<any[]>([]);
    const [selectedManager, setSelectedManager] = useState<string>('all');

    useEffect(() => {
        if (profile?.role === 'leader') {
            loadManagers();
        }
    }, [profile]);

    useEffect(() => {
        if (selectedClient) {
            loadHistory(selectedClient.id);
        } else {
            loadTodayHistory();
        }
    }, [selectedClient, selectedManager]);

    const loadManagers = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .order('name');
        setManagers(data || []);
    };

    const loadTodayHistory = async () => {
        setLoading(true);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let query = supabase
            .from('reports')
            .select('*, profiles(name), clients(name)')
            .gte('created_at', today.toISOString())
            .order('created_at', { ascending: false });

        if (selectedManager !== 'all') {
            query = query.eq('user_id', selectedManager);
        }

        const { data } = await query;
        setTodayReports(data || []);
        setLoading(false);
    };

    const loadHistory = async (clientId: string) => {
        setLoading(true);
        let query = supabase
            .from('reports')
            .select('*, profiles(name)')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (selectedManager !== 'all') {
            query = query.eq('user_id', selectedManager);
        }

        const { data } = await query;
        setReports(data || []);
        setLoading(false);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'visit': return MapPin;
            case 'phone': return Phone;
            case 'email': return Mail;
            default: return Clock;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'visit': return 'bg-blue-500 shadow-blue-200';
            case 'phone': return 'bg-green-500 shadow-green-200';
            case 'email': return 'bg-purple-500 shadow-purple-200';
            default: return 'bg-gray-500 shadow-gray-200';
        }
    };

    return (
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col space-y-2">
                <h1 className="text-3xl font-black text-gray-900 dark:text-white">고객사 히스토리</h1>
                <p className="text-gray-500 font-medium">과거 활동 내역을 확인하세요</p>
            </header>

            <div className="card-premium p-6 py-8 space-y-6">
                <div className="flex items-center space-x-2 text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
                    <Check size={12} className="text-primary" />
                    <span>필터링</span>
                </div>
                <ClientSearch onSelect={setSelectedClient} />

                {profile?.role === 'leader' && (
                    <div className="relative group">
                        <select
                            value={selectedManager}
                            onChange={(e) => setSelectedManager(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:border-primary/20 rounded-2xl pl-5 pr-10 py-4 text-sm font-bold appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all cursor-pointer text-gray-700 dark:text-gray-200"
                        >
                            <option value="all">전체 담당자 보기</option>
                            {managers.map((m) => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-primary transition-colors pointer-events-none" size={20} />
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
                </div>
            ) : selectedClient ? (
                <div className="space-y-8 px-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-gray-800 dark:text-gray-100">{selectedClient.name} 타임라인</h2>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">{reports.length} Activities</span>
                    </div>

                    {reports.length > 0 ? (
                        <div className="relative pl-8 space-y-10 before:content-[''] before:absolute before:left-[15px] before:top-4 before:bottom-0 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
                            {reports.map((report, idx) => {
                                const Icon = getIcon(report.type);
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={report.id}
                                        className="relative"
                                    >
                                        <div className={cn(
                                            "absolute -left-[43px] top-0 w-8 h-8 rounded-full flex items-center justify-center text-white border-[3px] border-white dark:border-gray-900 shadow-lg z-10",
                                            getColor(report.type)
                                        )}>
                                            <Icon size={14} />
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-gray-700 card-premium hover:scale-[1.01] transition-transform">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className={cn(
                                                    "text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md",
                                                    report.type === 'visit' ? "bg-blue-50 text-blue-500" :
                                                        report.type === 'phone' ? "bg-green-50 text-green-500" :
                                                            "bg-purple-50 text-purple-500"
                                                )}>
                                                    {report.type === 'visit' ? '방문' : report.type === 'phone' ? '전화' : '메일'}
                                                </span>
                                                <span className="text-xs font-bold text-gray-400">
                                                    {format(new Date(report.created_at), 'yyyy.MM.dd HH:mm', { locale: ko })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed font-medium">{report.content}</p>
                                            <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-end">
                                                <div className="flex items-center text-xs font-bold text-gray-400">
                                                    <User size={12} className="mr-1.5" />
                                                    {report.profiles?.name || '익명'}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-400">활동 내역이 없습니다.</div>
                    )}
                </div>
            ) : (
                <div className="space-y-8 px-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-gray-800 dark:text-gray-100">오늘의 전체 활동</h2>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">{todayReports.length} Activities</span>
                    </div>

                    {todayReports.length > 0 ? (
                        <div className="relative pl-8 space-y-10 before:content-[''] before:absolute before:left-[15px] before:top-4 before:bottom-0 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
                            {todayReports.map((report, idx) => {
                                const Icon = getIcon(report.type);
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={report.id}
                                        className="relative"
                                    >
                                        <div className={cn(
                                            "absolute -left-[43px] top-0 w-8 h-8 rounded-full flex items-center justify-center text-white border-[3px] border-white dark:border-gray-900 shadow-lg z-10",
                                            getColor(report.type)
                                        )}>
                                            <Icon size={14} />
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-6 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-gray-700 card-premium hover:scale-[1.01] transition-transform">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-1">
                                                        {report.clients?.name}
                                                    </span>
                                                    <span className={cn(
                                                        "text-[10px] font-bold uppercase tracking-wider w-fit px-2 py-0.5 rounded-md",
                                                        report.type === 'visit' ? "bg-blue-50 text-blue-500" :
                                                            report.type === 'phone' ? "bg-green-50 text-green-500" :
                                                                "bg-purple-50 text-purple-500"
                                                    )}>
                                                        {report.type === 'visit' ? '방문' : report.type === 'phone' ? '전화' : '메일'}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-bold text-gray-400">
                                                    {format(new Date(report.created_at), 'HH:mm', { locale: ko })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed font-medium">{report.content}</p>
                                            <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700 flex items-center justify-end">
                                                <div className="flex items-center text-xs font-bold text-gray-400">
                                                    <User size={12} className="mr-1.5" />
                                                    {report.profiles?.name || '익명'}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-24 text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                            <Clock size={48} className="mx-auto mb-4 opacity-20" />
                            <p className="font-medium">오늘 등록된 활동이 없습니다.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
