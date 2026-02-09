'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { MapPin, Phone, Mail, FileText, Pencil, X, Send, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function MyReportsPage() {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingReport, setEditingReport] = useState<any>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        loadMyReports();
    }, []);

    const loadMyReports = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('reports')
            .select('*, clients(name)')
            .order('created_at', { ascending: false });

        setReports(data || []);
        setLoading(false);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingReport) return;

        setIsUpdating(true);
        try {
            const { error } = await supabase
                .from('reports')
                .update({
                    type: editingReport.type,
                    content: editingReport.content
                })
                .eq('id', editingReport.id);

            if (error) throw error;

            alert('보고서가 수정되었습니다.');
            setEditingReport(null);
            loadMyReports();
        } catch (error: any) {
            alert('수정 실패: ' + error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!editingReport) return;
        if (!confirm('정말 이 보고서를 삭제하시겠습니까?')) return;

        setIsDeleting(true);
        try {
            const { error } = await supabase
                .from('reports')
                .delete()
                .eq('id', editingReport.id);

            if (error) throw error;

            alert('보고서가 삭제되었습니다.');
            setEditingReport(null);
            loadMyReports();
        } catch (error: any) {
            alert('삭제 실패: ' + error.message);
        } finally {
            setIsDeleting(false);
        }
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
                        <div key={report.id} className="group relative bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-all">
                            <button
                                onClick={() => setEditingReport({ ...report })}
                                className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 bg-gray-50 dark:bg-gray-700 rounded-full text-gray-400 hover:text-primary transition-all"
                            >
                                <Pencil size={14} />
                            </button>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center space-x-2">
                                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                                        {report.type === 'visit' && <MapPin size={16} className="text-blue-500" />}
                                        {report.type === 'phone' && <Phone size={16} className="text-green-500" />}
                                        {report.type === 'email' && <Mail size={16} className="text-purple-500" />}
                                    </div>
                                    <h3 className="font-bold text-gray-800 dark:text-gray-100">{report.clients?.name}</h3>
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium mr-8 group-hover:mr-0 transition-all">
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

            {/* Edit Modal */}
            <AnimatePresence>
                {editingReport && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-900 w-full max-w-md p-6 rounded-3xl shadow-2xl space-y-6"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold">보고서 수정</h2>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting || isUpdating}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors disabled:opacity-50"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                    <button onClick={() => setEditingReport(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 px-1">활동 종류</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'visit', label: '방문', icon: MapPin },
                                            { id: 'phone', label: '전화', icon: Phone },
                                            { id: 'email', label: '메일', icon: Mail },
                                        ].map((t) => {
                                            const Icon = t.icon;
                                            const isSelected = editingReport.type === t.id;
                                            return (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setEditingReport({ ...editingReport, type: t.id })}
                                                    className={cn(
                                                        "flex flex-col items-center p-3 rounded-2xl border-2 transition-all",
                                                        isSelected ? "border-primary bg-primary/5 text-primary" : "border-gray-100 dark:border-gray-800 text-gray-400"
                                                    )}
                                                >
                                                    <Icon size={18} className="mb-1" />
                                                    <span className="text-[10px] font-bold">{t.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 px-1">보고 내용</label>
                                    <textarea
                                        value={editingReport.content}
                                        onChange={(e) => setEditingReport({ ...editingReport, content: e.target.value })}
                                        rows={5}
                                        className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-primary shadow-inner resize-none text-sm"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleUpdate}
                                disabled={isUpdating || isDeleting}
                                className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {isUpdating ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                    <>
                                        <Send size={18} />
                                        <span>수정 완료</span>
                                    </>
                                )}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}


