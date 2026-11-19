'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock } from 'lucide-react';

// Sign-up is closed (Supabase "Allow new users to sign up" is off).
// New staff accounts are created by a leader from the Supabase dashboard.
export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            router.push('/');
        } catch (error) {
            setMessage(error instanceof Error && error.message ? error.message : '인증에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col justify-center animate-in fade-in duration-700">
            <div className="w-full max-w-md mx-auto space-y-8 p-6 bg-white dark:bg-gray-800 rounded-3xl shadow-xl">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
                        <LogIn size={32} />
                    </div>
                    <h1 className="text-2xl font-bold">반갑습니다</h1>
                    <p className="text-gray-500 mt-2">로그인하여 업무를 시작하세요</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Mail size={18} />
                        </div>
                        <input
                            type="email"
                            placeholder="이메일"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-primary outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                            <Lock size={18} />
                        </div>
                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-primary outline-none transition-all"
                            required
                        />
                    </div>

                    {message && (
                        <div className="p-4 rounded-2xl text-sm bg-red-50 text-red-600">
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="flex justify-center">
                                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                            </div>
                        ) : (
                            '로그인'
                        )}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400">
                    계정이 필요하면 팀장에게 요청하세요.
                </p>
            </div>
        </div>
    );
}
