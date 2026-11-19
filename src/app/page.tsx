'use client';

import { useCallback, useEffect, useState } from 'react';
import { ClientSearch } from '@/components/ClientSearch';
import { Send, LogOut, User as UserIcon, Check, X, Key, ShieldCheck, Sparkles, CalendarClock, BellRing } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { ACTIVITY_TYPES, type ActivityType, todayStr } from '@/lib/activity';
import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

/** One tap instead of a date picker — the default ("안 함") keeps the form as simple as before. */
const NEXT_CONTACT_CHOICES: { label: string; days: number | null }[] = [
  { label: '안 함', days: null },
  { label: '3일 뒤', days: 3 },
  { label: '1주 뒤', days: 7 },
  { label: '2주 뒤', days: 14 },
  { label: '한 달 뒤', days: 30 },
];

type ClientRef = { id: string; name: string };
type FollowUp = {
  id: string;
  activity_at: string;
  next_contact_on: string;
  next_action: string | null;
  clients: { id: string; name: string; last_visited_at: string | null } | null;
};

export default function Home() {
  const { user, profile, loading, signOut, updateProfile, updatePassword } = useAuth();
  const [selectedClient, setSelectedClient] = useState<ClientRef | null>(null);
  const [searchKey, setSearchKey] = useState(0); // remounts ClientSearch to reset / preselect it
  const [reportType, setReportType] = useState<ActivityType | null>(null);
  const [content, setContent] = useState('');
  const [nextContactOn, setNextContactOn] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);

  /**
   * 「오늘 연락할 곳」 — my reports whose next-contact date has arrived, for clients nobody has
   * touched since that report. Once anyone files a newer report for the client it drops off.
   */
  const loadFollowUps = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('reports')
      .select('id, activity_at, next_contact_on, next_action, clients(id, name, last_visited_at)')
      .eq('user_id', user.id)
      .not('next_contact_on', 'is', null)
      .lte('next_contact_on', todayStr())
      .order('next_contact_on', { ascending: true })
      .limit(200);
    const rows = (data ?? []) as unknown as FollowUp[];
    const byClient = new Map<string, FollowUp>();
    for (const r of rows) {
      const c = r.clients;
      if (!c) continue;
      const touchedSince = c.last_visited_at && new Date(c.last_visited_at) > new Date(r.activity_at);
      if (touchedSince) continue;
      const prev = byClient.get(c.id);
      if (!prev || prev.activity_at < r.activity_at) byClient.set(c.id, r);
    }
    setFollowUps([...byClient.values()].sort((a, b) => a.next_contact_on.localeCompare(b.next_contact_on)));
  }, [user]);

  useEffect(() => {
    if (!loading && user) loadFollowUps();
  }, [loading, user, loadFollowUps]);

  const resetForm = () => {
    setSelectedClient(null);
    setSearchKey((k) => k + 1);
    setReportType(null);
    setContent('');
    setNextContactOn('');
    setNextAction('');
  };

  const pickFollowUp = (f: FollowUp) => {
    if (!f.clients) return;
    setSelectedClient({ id: f.clients.id, name: f.clients.name });
    setSearchKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      const { error } = await supabase.from('reports').insert([
        {
          user_id: user.id,
          client_id: selectedClient.id,
          type: reportType,
          content,
          next_contact_on: nextContactOn || null,
          next_action: nextContactOn && nextAction.trim() ? nextAction.trim() : null,
        },
      ]);
      if (error) throw error;

      alert('보고서가 제출되었습니다.');
      resetForm();
      loadFollowUps();
    } catch (err) {
      alert('제출 실패: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNameUpdate = async () => {
    if (!newName.trim()) return;
    try {
      await updateProfile({ name: newName.trim() });
      setIsEditingName(false);
    } catch {
      alert('이름 수정에 실패했습니다.');
    }
  };

  const closePasswordModal = () => {
    setIsChangingPassword(false);
    setNewPassword('');
    setConfirmPassword('');
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
      // No artificial timeout: on a slow network the change can succeed after a few seconds,
      // and a timeout used to report "failed" for a password that had actually changed.
      await updatePassword(newPassword);
      alert('비밀번호가 변경되었습니다. 다음 로그인부터 새 비밀번호를 사용하세요.');
      closePasswordModal();
    } catch (err) {
      alert('비밀번호 변경 실패: ' + (err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'));
    } finally {
      setIsPasswordUpdating(false);
    }
  };

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
                  // Always visible on phones (no hover there); hover-reveal only on desktop.
                  className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-primary"
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

      {followUps.length > 0 && (
        <section className="card-premium p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center text-sm font-black text-gray-800 dark:text-gray-100">
              <BellRing size={16} className="mr-2 text-primary" />
              오늘 연락할 곳
            </h2>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{followUps.length}</span>
          </div>
          <div className="space-y-2">
            {followUps.map((f) => {
              const late = differenceInCalendarDays(new Date(), parseISO(f.next_contact_on));
              return (
                <button
                  key={f.id}
                  onClick={() => pickFollowUp(f)}
                  className="w-full flex items-center justify-between text-left p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50 hover:bg-primary/5 active:scale-[0.99] transition-all"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-gray-800 dark:text-gray-100 truncate">{f.clients?.name}</div>
                    {f.next_action && <div className="text-xs text-gray-500 truncate mt-0.5">{f.next_action}</div>}
                  </div>
                  <span className={cn('text-xs font-bold shrink-0 ml-3', late > 0 ? 'text-red-500' : 'text-primary')}>
                    {late > 0 ? `${late}일 지남` : '오늘'}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-400">누르면 아래 보고 작성에 고객사가 들어갑니다. 보고를 내면 목록에서 빠집니다.</p>
        </section>
      )}

      <div className="card-premium p-6 space-y-6">
        <section className="space-y-3">
          <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-1">1. 고객사 선택</label>
          <ClientSearch
            key={searchKey}
            defaultClient={selectedClient}
            onSelect={setSelectedClient}
            onClear={() => setSelectedClient(null)}
          />
          {selectedClient && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center text-sm font-bold text-primary bg-primary/10 pl-4 pr-1.5 py-1.5 rounded-xl w-fit"
            >
              <Check size={14} className="mr-2" />
              선택됨: {selectedClient.name}
              <button
                type="button"
                onClick={() => {
                  setSelectedClient(null);
                  setSearchKey((k) => k + 1);
                }}
                aria-label="선택 해제"
                className="ml-2 p-1 rounded-lg hover:bg-primary/20 transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </section>

        <section className="space-y-3">
          <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-1">2. 활동 종류</label>
          <div className="grid grid-cols-3 gap-4">
            {ACTIVITY_TYPES.map((t) => {
              const Icon = t.icon;
              const isSelected = reportType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setReportType(t.id)}
                  className={cn(
                    "relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all active:scale-95 duration-300",
                    isSelected
                      ? `${t.solid} shadow-lg scale-[1.02] ring-2 ring-offset-2 ring-primary/20`
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

        <section className="space-y-3">
          <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-1 flex items-center">
            <CalendarClock size={14} className="mr-1.5" />
            4. 다음 연락 (선택)
          </label>
          <div className="flex flex-wrap gap-2">
            {NEXT_CONTACT_CHOICES.map((c) => {
              const value = c.days === null ? '' : format(addDays(new Date(), c.days), 'yyyy-MM-dd');
              const isSelected = nextContactOn === value;
              return (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => {
                    setNextContactOn(value);
                    if (!value) setNextAction('');
                  }}
                  className={cn(
                    'px-3.5 py-2 rounded-xl text-sm font-bold transition-all active:scale-95',
                    isSelected ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-gray-50 dark:bg-gray-900/50 text-gray-500'
                  )}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
          {nextContactOn && (
            <p className="text-xs font-bold text-primary pl-1">
              {format(parseISO(nextContactOn), 'M월 d일(E)', { locale: ko })}에 「오늘 연락할 곳」에 뜹니다.
            </p>
          )}
          {nextContactOn && (
            <input
              type="text"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="다음에 할 일 (예: 샘플 회신 확인)"
              className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border-2 border-transparent focus:border-primary/20 outline-none font-medium"
            />
          )}
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
                  onClick={closePasswordModal}
                  className="flex-1 py-4 rounded-xl font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 transition-all"
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
