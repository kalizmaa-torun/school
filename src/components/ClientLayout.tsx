"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { setSession, user, children, setChildren, _hasHydrated, isAuthLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // 앱 로드 시 현재 세션 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 인증 상태 변경 리스너 등록
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession]);

  // 세션이 있는데 자녀 정보가 없는 경우 (새로고침 등) 자녀 정보 재조회
  useEffect(() => {
    if (user && children.length === 0) {
      const fetchChildren = async () => {
        const loginId = user.user_metadata?.login_id || user.email?.split('@')[0];
        if (!loginId) return;

        const { data, error } = await supabase
          .from('user_baby')
          .select('*')
          .eq('parents_id', loginId);

        if (!error && data) {
          setChildren(data as any[]);
        }
      };
      fetchChildren();
    }
  }, [user, children.length, setChildren]);

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  useEffect(() => {
    if (!_hasHydrated || isAuthLoading) return;

    if (!user && !isAuthPage) {
      router.push("/login");
    }
  }, [_hasHydrated, isAuthLoading, user, isAuthPage, router]);

  // 하이드레이션 완료 전이거나 인증 확인 중인 경우 로딩 표시 (배경이 깜빡이는 것 방지)
  if (!_hasHydrated || isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--background)">
        <Loader2 className="w-12 h-12 text-(--primary) animate-spin" />
      </div>
    );
  }

  // 인증되지 않은 유저가 권한이 없는 페이지에 접근할 경우 아무것도 렌더링하지 않음 (useEffect에서 리다이렉트 처리)
  if (!user && !isAuthPage) {
    return null;
  }

  if (isAuthPage) {
    return (
      <main className="min-h-screen bg-(--background) flex items-center justify-center relative overflow-hidden">
        {/* Auth pages background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[100px]" />
        </div>
        
        {children}
      </main>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
