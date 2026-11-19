'use client';

import { useState } from 'react';
import { X, Send, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { ACTIVITY_TYPES } from '@/lib/activity';

export type EditableReport = { id: string; type: string; content: string; clientName?: string };

/**
 * Edit / delete one report. Shared by the home screen (「오늘 내 보고」) and the report list.
 * `onDone(message)` runs after a successful save or delete so the caller can reload and confirm.
 */
export function ReportEditModal({
    report,
    onClose,
    onDone,
}: {
    report: EditableReport | null;
    onClose: () => void;
    onDone: (message: string) => void;
}) {
    return (
        <AnimatePresence>
            {report && <Dialog key={report.id} initial={report} onClose={onClose} onDone={onDone} />}
        </AnimatePresence>
    );
}

function Dialog({ initial, onClose, onDone }: { initial: EditableReport; onClose: () => void; onDone: (message: string) => void }) {
    const [draft, setDraft] = useState(initial);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleUpdate = async () => {
        if (!draft.content.trim()) {
            alert('보고 내용을 입력해주세요.');
            return;
        }
        setIsUpdating(true);
        try {
            const { error } = await supabase.from('reports').update({ type: draft.type, content: draft.content }).eq('id', draft.id);
            if (error) throw error;
            onDone('보고를 수정했습니다');
        } catch (error) {
            alert('수정 실패: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('정말 이 보고서를 삭제하시겠습니까?')) return;
        setIsDeleting(true);
        try {
            const { error } = await supabase.from('reports').delete().eq('id', draft.id);
            if (error) throw error;
            onDone('보고를 삭제했습니다');
        } catch (error) {
            alert('삭제 실패: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-900 w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl space-y-6 border border-gray-100 dark:border-gray-800"
            >
                <div className="flex justify-between items-center mb-2">
                    <div className="min-w-0">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white">보고서 수정</h2>
                        {draft.clientName && <p className="text-sm font-bold text-primary truncate mt-0.5">{draft.clientName}</p>}
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting || isUpdating}
                            aria-label="보고서 삭제"
                            className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-colors disabled:opacity-50"
                        >
                            <Trash2 size={20} />
                        </button>
                        <button onClick={onClose} aria-label="닫기" className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-colors text-gray-500">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">활동 종류</label>
                        <div className="grid grid-cols-3 gap-3">
                            {ACTIVITY_TYPES.map((t) => {
                                const Icon = t.icon;
                                const isSelected = draft.type === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => setDraft({ ...draft, type: t.id })}
                                        className={cn(
                                            'flex flex-col items-center justify-start px-2 py-4 rounded-2xl transition-all border-2',
                                            isSelected
                                                ? 'border-primary bg-primary/5 text-primary shadow-sm'
                                                : 'border-transparent bg-gray-50 dark:bg-gray-800 text-gray-400'
                                        )}
                                    >
                                        <Icon size={20} className={cn('mb-1 transition-transform', isSelected && 'scale-110')} />
                                        <span className="text-xs font-bold text-center leading-tight break-keep">{t.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">보고 내용</label>
                        <textarea
                            value={draft.content}
                            onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                            rows={6}
                            className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all resize-none text-sm font-medium leading-relaxed"
                        />
                    </div>
                </div>

                <button
                    onClick={handleUpdate}
                    disabled={isUpdating || isDeleting}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 text-lg mt-4"
                >
                    {isUpdating ? (
                        <div className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full" />
                    ) : (
                        <>
                            <Send size={20} />
                            <span>수정 완료</span>
                        </>
                    )}
                </button>
            </motion.div>
        </div>
    );
}
