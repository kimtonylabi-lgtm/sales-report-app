'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { MapPin, Phone, Mail, FileText } from 'lucide-react';

export default function MyReportsPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMyReports();
    }, []);

    const loadMyReports = async () => {
        setLoading(true);
        // Ideally filter by auth.uid()
        const { data } = await supabase
            .from('reports')
            .select('*, clients(name)')
            .order('created_at', { ascending: false });

        setReports(data || []);
        setLoading(false);
    };

    return (
        <div className="space-y-6 pb-12">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold">내 보고 목록</h1>
                    <p className="text-gray-500">내가 작성한 성과를 확인하세요</p>
                </div>
                <div className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full font-medium">
                    총 {reports.length}건
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
            ) : reports.length > 0 ? (
                <div className="space-y-4">
                    {reports.map((report) => (
                        <div key={report.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-all">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center space-x-2">
                                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                                        {report.type === 'visit' && <MapPin size={16} className="text-blue-500" />}
                                        {report.type === 'phone' && <Phone size={16} className="text-green-500" />}
                                        {report.type === 'email' && <Mail size={16} className="text-purple-500" />}
                                    </div>
                                    <h3 className="font-bold text-gray-800 dark:text-gray-100">{report.clients?.name}</h3>
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium">
                                    {format(new Date(report.created_at), 'MM/dd HH:mm', { locale: ko })}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{report.content}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 space-y-4 text-gray-400">
                    <FileText size={48} className="mx-auto opacity-20" />
                    <p>아직 작성한 보고서가 없습니다.</p>
                </div>
            )}
        </div>
    );
}
