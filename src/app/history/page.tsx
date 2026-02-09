'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ClientSearch } from '@/components/ClientSearch';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HistoryPage() {
    const [selectedClient, setSelectedClient] = useState<{ id: string, name: string } | null>(null);
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedClient) {
            loadHistory(selectedClient.id);
        }
    }, [selectedClient]);

    const loadHistory = async (clientId: string) => {
        setLoading(true);
        const { data } = await supabase
            .from('reports')
            .select('*, profiles(name)')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

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
            case 'visit': return 'bg-blue-500';
            case 'phone': return 'bg-green-500';
            case 'email': return 'bg-purple-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold">고객사 히스토리</h1>
                <p className="text-gray-500">과거 활동 내역을 확인하세요</p>
            </header>

            <ClientSearch onSelect={setSelectedClient} />

            {selectedClient ? (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold">{selectedClient.name} 타임라인</h2>
                        <span className="text-xs text-gray-400">{reports.length}개의 기록</span>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                        </div>
                    ) : reports.length > 0 ? (
                        <div className="relative pl-6 space-y-8 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
                            {reports.map((report) => {
                                const Icon = getIcon(report.type);
                                return (
                                    <div key={report.id} className="relative">
                                        <div className={cn(
                                            "absolute -left-[27px] top-1 w-6 h-6 rounded-full flex items-center justify-center text-white border-4 border-background",
                                            getColor(report.type)
                                        )}>
                                            <Icon size={12} />
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-xs font-bold text-gray-400 capitalize">
                                                    {report.type === 'visit' ? '방문' : report.type === 'phone' ? '전화' : '메일'}
                                                </span>
                                                <span className="text-[10px] text-gray-400">
                                                    {format(new Date(report.created_at), 'yyyy.MM.dd HH:mm', { locale: ko })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{report.content}</p>
                                            <div className="mt-3 text-[10px] font-medium text-gray-400">
                                                작성자: {report.profiles?.name || '익명'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-400">활동 내역이 없습니다.</div>
                    )}
                </div>
            ) : (
                <div className="text-center py-20 text-gray-400 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                    고객사를 검색하여 선택해주세요.
                </div>
            )}
        </div>
    );
}
