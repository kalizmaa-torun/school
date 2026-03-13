"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore, ChildData } from '@/store/authStore';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const login = useAuthStore(state => state.login);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      // 1. 유저 확인
      const { data: userData, error: userError } = await supabase
        .from('school_user')
        .select('*')
        .eq('id', username)
        .eq('password', password)
        .single(); // 정확히 1건 매칭 기대

      if (userError || !userData) {
        setErrorMsg('아이디 또는 비밀번호가 일치하지 않습니다.');
        setIsLoading(false);
        return;
      }

      // 2. 해당 유저의 자녀 목록 가져오기
      const { data: childrenData, error: childrenError } = await supabase
        .from('user_baby')
        .select('*')
        .eq('parents_id', username);

      if (childrenError) {
        console.error('Failed to fetch children info:', childrenError);
        setErrorMsg('자녀 정보를 불러오는 중 오류가 발생했습니다.');
        setIsLoading(false);
        return;
      }

      // 3. Zustand 스토어에 로그인 정보 저장
      login(
        { id: userData.id, user_name: userData.user_name },
        childrenData as ChildData[]
      );

      // 4. 대시보드로 이동
      router.push('/');
      
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('로그인 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 glass rounded-3xl shadow-xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          스쿨 보드
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          계정 정보를 입력해주세요.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">아이디</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              placeholder="아이디를 입력하세요"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">비밀번호</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              placeholder="비밀번호를 입력하세요"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
            <p className="text-sm text-red-600 dark:text-red-400 text-center">{errorMsg}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-70"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            '로그인'
          )}
        </button>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              회원가입
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
