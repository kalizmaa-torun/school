"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  School,
  Calendar, 
  Utensils, 
  BookOpen, 
  Users,
  Settings, 
  LogOut 
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabaseClient";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isMobileMenuOpen, setMobileMenuOpen } = useAuthStore();

  // 사용자 아이디 확인 (mohani7 여부 체크용)
  const userMetadata = user?.user_metadata;
  const currentUserId = userMetadata?.login_id || user?.email?.split('@')[0] || "";
  const isAdmin = currentUserId === "mohani7";

  const navItems = [
    { name: "수업시간표", href: "/", icon: Calendar },
    { name: "급식메뉴", href: "/meals", icon: Utensils },
    { name: "숙제관리", href: "/homework", icon: BookOpen },
    { name: "커뮤니티", href: "/community", icon: Users },
  ];

  // 관리자일 경우 관리자 메뉴 추가
  if (isAdmin) {
    navItems.push({ name: "관리자 메뉴", href: "/admin", icon: Settings });
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    router.push('/login');
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 w-64 flex flex-col bg-[var(--surface)] border-r border-[var(--border)] shadow-xl z-50 
        transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:shadow-sm
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
      <div className="h-16 flex items-center px-6 border-b border-[var(--border)]">
        <div className="mr-3 w-8 h-8 flex items-center justify-center overflow-hidden rounded-lg">
          <img src="/school_logo.png" alt="School Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-lg font-bold text-[var(--foreground)] tracking-tight mt-0.5">스쿨 보드</h1>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? "bg-[var(--primary)] text-white shadow-md shadow-blue-500/20" 
                  : "text-slate-500 dark:text-slate-400 hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon size={20} className={`mr-3 transition-colors ${isActive ? "text-white" : "group-hover:text-[var(--primary)]"}`} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center px-3 py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 transition-colors"
        >
          <LogOut size={18} className="mr-3 text-red-500" />
          <span className="font-medium text-sm">로그아웃</span>
        </button>
      </div>
    </aside>
    </>
  );
}
