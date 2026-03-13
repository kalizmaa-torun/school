"use client";

import { Bell, Search, Menu, ChevronDown, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardHeader() {
  const { user, children, selectedChildIndex, setSelectedChildIndex, logout, setMobileMenuOpen, isMobileMenuOpen } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const activeChild = children[selectedChildIndex];

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-[var(--surface)] border-b border-[var(--border)] shadow-sm z-10 transition-colors duration-300">
      <div className="flex items-center">
        <button 
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 mr-3 text-slate-500 hover:text-[var(--primary)] rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="검색어 입력..." 
            className="pl-10 pr-4 py-2 w-64 rounded-full bg-[var(--surface-hover)] border-none text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-shadow"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 text-slate-500 hover:text-[var(--primary)] rounded-full hover:bg-[var(--surface-hover)] transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--surface)]"></span>
        </button>
        
        <div className="flex items-center space-x-3 pl-4 border-l border-[var(--border)]">
          {user ? (
            <div className="relative flex items-center gap-3" ref={dropdownRef}>
              <div className="hidden sm:block text-right cursor-pointer group" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                <p className="text-sm font-semibold text-[var(--foreground)] group-hover:text-blue-600 transition-colors flex items-center justify-end">
                  {user.user_name} 학부모님 <ChevronDown size={14} className="ml-1 text-slate-400" />
                </p>
                {activeChild ? (
                  <p className="text-xs text-slate-500">
                    {activeChild.baby_name} ({activeChild.baby_grade}학년 {activeChild.baby_class}반)
                  </p>
                ) : (
                  <p className="text-xs text-slate-500">등록된 자녀 없음</p>
                )}
              </div>
              
              <div 
                className="w-9 h-9 rounded-full bg-linear-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-md cursor-pointer border-2 border-transparent hover:border-blue-400 transition-all"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="text-white text-sm font-bold">{user.user_name.charAt(0)}</span>
              </div>

              {/* 자녀 선택 드롭다운 */}
              {isDropdownOpen && children.length > 0 && (
                <div className="absolute top-12 right-0 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden py-1 z-50">
                  <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">자녀 선택</p>
                  </div>
                  {children.map((child, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedChildIndex(idx);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        idx === selectedChildIndex 
                          ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-medium' 
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      {child.baby_name} ({child.baby_school})
                    </button>
                  ))}
                  <div className="border-t border-slate-100 dark:border-slate-700 mt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors gap-2"
                    >
                      <LogOut size={14} /> 로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="text-sm font-medium px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
