'use client';

import { useState } from 'react';
import { ClientSearch } from '@/components/ClientSearch';
import { MapPin, Phone, Mail, Send, LogOut, User as UserIcon, Check, X, Key, ShieldCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';

export default function Home() {
  const { user, profile, loading, signOut, updateProfile, updatePassword } = useAuth();
  const [selectedClient, setSelectedClient] = useState<{ id: string, name: string } | null>(null);
  const [reportType, setReportType] = useState<'visit' | 'phone' | 'email' | null>(null);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);

  const handleSubmit = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!selectedClient || !reportType || !content) {
      alert('고객사, 활동 종류, 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 2. Insert Report
      const { error } = await supabase
        .from('reports')
        .insert([{
          user_id: user.id,
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

  const handleNameUpdate = async () => {
    if (!newName.trim()) return;
    try {
      await updateProfile({ name: newName.trim() });
      setIsEditingName(false);
    } catch (err) {
      alert('이름 수정에 실패했습니다.');
    }
  };

  const handlePasswordUpdate = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsPasswordUpdating(true);
    try {
      await updatePassword(newPassword);
      alert('비밀번호가 성공적으로 변경되었습니다.');
      setIsChangingPassword(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      alert('비밀번호 변경 실패: ' + err.message);
    } finally {
      setIsPasswordUpdating(false);
    }
  };


  const types = [
    { id: 'visit', label: '방문', icon: MapPin, color: 'bg-blue-500 text-white shadow-blue-200' },
    { id: 'phone', label: '전화', icon: Phone, color: 'bg-green-500 text-white shadow-green-200' },
    { id: 'email', label: '메일', icon: Mail, color: 'bg-purple-500 text-white shadow-purple-200' },
  ];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-start">
        <div className="flex-1 mr-4">
          <div className="flex items-center space-x-2 text-primary font-bold text-sm mb-1 uppercase tracking-wider">
            <Sparkles size={14} className="animate-pulse" />
            <span>Daily Report</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">오늘의 업무보고</h1>
          <div className="flex items-center mt-2 group">
            {isEditingName ? (
              <div className="flex items-center space-x-2 w-full">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-transparent border-b-2 border-primary outline-none px-1 text-gray-700 dark:text-gray-200 w-32 font-bold"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleNameUpdate()}
                />
                <button onClick={handleNameUpdate} className="text-green-500 p-1 hover:bg-green-50 rounded-full transition-colors">
                  <Check size={18} />
                </button>
                <button onClick={() => setIsEditingName(false)} className="text-red-500 p-1 hover:bg-red-50 rounded-full transition-colors">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center text-gray-500 font-medium">
                <p className="truncate mr-2">
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {profile?.name || user?.email?.split('@')[0]}
                  </span>
                  님, 좋은 하루 되세요!
                </p>
                <button
                  onClick={() => {
                    setNewName(profile?.name || '');
                    setIsEditingName(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-primary"
                  title="이름 수정"
                >
                  <UserIcon size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsChangingPassword(true)}
            className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-gray-400 hover:text-primary hover:shadow-md transition-all active:scale-95"
            title="비밀번호 변경"
          >
            <Key size={20} />
          </button>
          <button
            onClick={signOut}
            className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-gray-400 hover:text-red-500 hover:shadow-md transition-all active:scale-95"
            title="로그아웃"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="card-premium p-6 space-y-6">
        <section className="space-y-3">
          <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-1">1. 고객사 선택</label>
          <ClientSearch onSelect={setSelectedClient} />
          {selectedClient && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center text-sm font-bold text-primary bg-primary/10 px-4 py-2 rounded-xl w-fit"
            >
              <Check size={14} className="mr-2" />
              선택됨: {selectedClient.name}
            </motion.div>
          )}
        </section>

        <section className="space-y-3">
          <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-1">2. 활동 종류</label>
          <div className="grid grid-cols-3 gap-4">
            {types.map((t) => {
              const Icon = t.icon;
              const isSelected = reportType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setReportType(t.id as any)}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all active:scale-95 duration-300",
                    isSelected
                      ? `${t.color} shadow-lg scale-[1.02] ring-2 ring-offset-2 ring-primary/20`
                      : "bg-gray-50 dark:bg-gray-700/50 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon size={24} className={cn("mb-2 transition-transform", isSelected && "scale-110")} />
                  <span className="font-bold text-sm">{t.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-1">3. 보고 내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="상담 결과, 특이사항 등을 기록하세요..."
            rows={4}
            className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-gray-900 outline-none transition-all placeholder:text-gray-400 resize-none font-medium"
          />
        </section>

        <div className="pt-2">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedClient || !reportType || !content}
            className="w-full btn-premium py-5 rounded-2xl font-black text-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:grayscale disabled:shadow-none"
          >
            {isSubmitting ? (
              <div className="animate-spin h-6 w-6 border-4 border-white border-t-transparent rounded-full" />
            ) : (
              <>
                <Send size={20} />
                <span>보고서 제출하기</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      <AnimatePresence>
        {isChangingPassword && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2rem] p-8 shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  <ShieldCheck size={32} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">비밀번호 변경</h2>
                <p className="text-gray-500 text-sm mt-1">새로운 비밀번호를 입력해주세요</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">새 비밀번호</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="최소 6자 이상"
                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary/20 outline-none transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">비밀번호 확인</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호 다시 입력"
                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-primary/20 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-8">
                <button
                  onClick={() => {
                    setIsChangingPassword(false);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="flex-1 py-4 rounded-xl font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition-all font-bold"
                >
                  취소
                </button>
                <button
                  onClick={handlePasswordUpdate}
                  disabled={isPasswordUpdating || !newPassword || newPassword !== confirmPassword}
                  className="flex-[2] py-4 rounded-xl font-bold text-white bg-primary hover:opacity-90 shadow-lg shadow-primary/30 transition-all disabled:opacity-50"
                >
                  {isPasswordUpdating ? '변경 중...' : '변경하기'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
