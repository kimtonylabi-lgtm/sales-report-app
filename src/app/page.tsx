'use client';

import { useState } from 'react';
import { ClientSearch } from '@/components/ClientSearch';
import { MapPin, Phone, Mail, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [selectedClient, setSelectedClient] = useState<{ id: string, name: string } | null>(null);
  const [reportType, setReportType] = useState<'visit' | 'phone' | 'email' | null>(null);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedClient || !reportType || !content) {
      alert('고객사, 활동 종류, 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      // For MVP, we use a fixed user ID if not logged in, 
      // but ideally we should have a user session.
      // Let's assume there's a test user profile in the DB.
      // For this demo, we'll try to get the current user or use a placeholder if none.
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('reports')
        .insert([{
          user_id: user?.id || '00000000-0000-0000-0000-000000000000', // Update this after auth setup
          client_id: selectedClient.id,
          type: reportType,
          content: content
        }]);

      if (error) throw error;

      alert('보고서가 제출되었습니다.');
      // Reset form
      setSelectedClient(null);
      setReportType(null);
      setContent('');
    } catch (err: any) {
      alert('제출 실패: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const types = [
    { id: 'visit', label: '방문', icon: MapPin, color: 'bg-blue-100 text-blue-600 border-blue-200' },
    { id: 'phone', label: '전화', icon: Phone, color: 'bg-green-100 text-green-600 border-green-200' },
    { id: 'email', label: '메일', icon: Mail, color: 'bg-purple-100 text-purple-600 border-purple-200' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-2xl font-bold">오늘의 업무보고</h1>
        <p className="text-gray-500">오늘 어떤 활동을 하셨나요?</p>
      </header>

      <section className="space-y-3">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">1. 고객사 선택</label>
        <ClientSearch onSelect={setSelectedClient} />
        {selectedClient && (
          <div className="flex items-center text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full w-fit">
            선택됨: {selectedClient.name}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">2. 활동 종류</label>
        <div className="grid grid-cols-3 gap-4">
          {types.map((t) => {
            const Icon = t.icon;
            const isSelected = reportType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setReportType(t.id as any)}
                className={cn(
                  "btn-large border-2",
                  isSelected ? `${t.color} border-current ring-2 ring-current ring-offset-2` : "bg-white dark:bg-gray-800 border-transparent text-gray-500"
                )}
              >
                <Icon size={28} className="mb-2" />
                <span className="font-bold">{t.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">3. 보고 내용</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="상담 결과, 특이사항 등을 기록하세요..."
          rows={4}
          className="w-full p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm resize-none"
        />
      </section>

      <div className="pt-4 pb-12">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedClient || !reportType || !content}
          className="w-full bg-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
        >
          {isSubmitting ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <>
              <Send size={20} />
              <span>보고서 제출하기</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
