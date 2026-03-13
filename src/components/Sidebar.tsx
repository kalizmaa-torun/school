"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Bus,
  LayoutDashboard, 
  Utensils, 
  CheckSquare, 
  Settings, 
  Power 
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore(state => state.logout);

  const navItems = [
    { name: "대시보드", href: "/", icon: LayoutDashboard },
    { name: "급식메뉴", href: "/meals", icon: Utensils },
    { name: "과제 관리", href: "/tasks", icon: CheckSquare },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 flex flex-col bg-[var(--surface)] border-r border-[var(--border)] shadow-sm hidden md:flex z-10 transition-colors duration-300">
      <div className="h-16 flex items-center px-6 border-b border-[var(--border)]">
        <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center mr-3 shadow-md shadow-amber-500/20">
          <Bus size={18} className="text-white" />
        </div>
        <h1 className="text-lg font-bold text-[var(--foreground)] tracking-tight">스쿨 보드</h1>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href}
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
          <Power size={18} className="mr-3 text-red-500" />
          <span className="font-medium text-sm">로그아웃</span>
        </button>
      </div>
    </aside>
  );
}
