"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { 
  Loader2, 
  Users, 
  Baby, 
  Search, 
  Eye, 
  EyeOff, 
  ExternalLink,
  School,
  TrendingUp,
  Filter
} from "lucide-react";

interface AdminUserData {
  id: string;
  user_name: string;
  password?: string;
  created_at?: string;
}

interface AdminChildData {
  id: number;
  baby_name: string;
  baby_grade: string;
  baby_class: string;
  baby_school: string;
  parents_id: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, _hasHydrated } = useAuthStore();
  const [users, setUsers] = useState<AdminUserData[]>([]);
  const [children, setChildren] = useState<AdminChildData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"users" | "children">("users");
  const [searchQuery, setSearchQuery] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // 권한 체크: mohani7이 아니면 홈으로 리다이렉트
  useEffect(() => {
    if (_hasHydrated) {
      const userMetadata = user?.user_metadata;
      const currentUserId = userMetadata?.login_id || user?.email?.split('@')[0] || "";
      
      if (currentUserId !== "mohani7") {
        router.push("/");
      } else {
        fetchAdminData();
      }
    }
  }, [user, _hasHydrated, router]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const { data: userData, error: userError } = await supabase
        .from("school_user")
        .select("*")
        .order("id", { ascending: true });

      if (userError) throw userError;

      const { data: childrenData, error: childrenError } = await supabase
        .from("user_baby")
        .select("*")
        .order("parents_id", { ascending: true });

      if (childrenError) throw childrenError;

      setUsers(userData || []);
      setChildren(childrenData || []);
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePassword = (userId: string) => {
    setVisiblePasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  // 필터링된 데이터
  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      u.user_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  const filteredChildren = useMemo(() => {
    return children.filter(c => 
      c.baby_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.baby_school.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.parents_id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [children, searchQuery]);

  // 통계 계산
  const stats = useMemo(() => {
    const uniqueSchools = new Set(children.map(c => c.baby_school)).size;
    return [
      { label: "총 가입 유저", value: users.length, icon: Users, color: "orange" },
      { label: "등록 자녀 수", value: children.length, icon: Baby, color: "amber" },
      { label: "활성 학교 수", value: uniqueSchools, icon: School, color: "stone" },
      { label: "평균 자녀 수", value: users.length ? (children.length / users.length).toFixed(1) : 0, icon: TrendingUp, color: "orange" },
    ];
  }, [users, children]);

  if (!_hasHydrated || isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header & Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                <stat.icon size={20} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="text-2xl font-black text-[var(--foreground)]">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="glass rounded-[2rem] border border-slate-200/50 dark:border-stone-700/50 shadow-lg overflow-hidden border-t-4 border-t-[var(--primary)]">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-50/50 dark:bg-stone-900/30">
          <div className="flex items-center gap-2 p-1 bg-white dark:bg-stone-800 rounded-2xl shadow-inner border border-stone-200 dark:border-stone-700">
            <button 
              onClick={() => setActiveTab("users")}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "users" ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30" : "text-stone-500 hover:text-[var(--primary)]"}`}
            >
              유저 관리
            </button>
            <button 
              onClick={() => setActiveTab("children")}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "children" ? "bg-orange-600 text-white shadow-lg shadow-orange-500/30" : "text-stone-500 hover:text-orange-500"}`}
            >
              자녀 정보
            </button>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={activeTab === "users" ? "아이디 또는 이름 검색..." : "이름, 학교 또는 부모ID 검색..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm transition-all"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          {activeTab === "users" ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/50 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                  <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">No.</th>
                  <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">유저 아이디</th>
                  <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">이름</th>
                  <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">비밀번호</th>
                  <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">등록 자녀</th>
                  <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u, idx) => {
                  const userKids = children.filter(c => c.parents_id === u.id);
                  const isVisible = visiblePasswords[u.id];
                  return (
                    <tr key={u.id} className="hover:bg-orange-50/30 dark:hover:bg-orange-500/5 transition-colors group">
                      <td className="px-6 py-4 text-xs font-mono text-stone-400">{idx + 1}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[var(--foreground)]">{u.id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-stone-600 dark:text-stone-300">{u.user_name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded text-xs font-mono">
                            {isVisible ? u.password : "••••••••"}
                          </code>
                          <button 
                            onClick={() => togglePassword(u.id)}
                            className="p-1 hover:text-[var(--primary)] text-stone-400 transition-colors"
                          >
                            {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex -space-x-2">
                          {userKids.length > 0 ? (
                            userKids.slice(0, 3).map((k, i) => (
                              <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-stone-900 bg-orange-400 flex items-center justify-center text-[10px] text-white font-bold" title={k.baby_name}>
                                {k.baby_name.charAt(0)}
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-stone-400 italic">없음</span>
                          )}
                          {userKids.length > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-stone-900 bg-stone-200 dark:bg-stone-700 flex items-center justify-center text-[10px] text-stone-500 font-bold">
                              +{userKids.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 mr-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-stone-400 hover:text-[var(--primary)] transition-all opacity-0 group-hover:opacity-100">
                          <Filter size={16} />
                        </button>
                        <button className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-stone-400 hover:text-[var(--primary)] transition-all opacity-0 group-hover:opacity-100">
                          <ExternalLink size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-900/50 text-[10px] uppercase tracking-widest text-slate-400 font-black">
                  <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">자녀 이름</th>
                  <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">소속 학교</th>
                  <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">학년/반</th>
                  <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">부모 ID</th>
                  <th className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 text-right">상태</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredChildren.map((c) => (
                  <tr key={c.id} className="hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                          <Baby size={16} />
                        </div>
                        <span className="font-bold text-sm text-[var(--foreground)]">{c.baby_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <School size={14} className="text-slate-400" />
                        <span className="text-sm">{c.baby_school}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500">
                        {c.baby_grade}학년 {c.baby_class}반
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-blue-500 hover:underline cursor-pointer">
                      {c.parents_id}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">데이터 연동됨</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {(activeTab === "users" ? filteredUsers : filteredChildren).length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Search size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">검색 결과가 없습니다.</p>
              <button 
                onClick={() => setSearchQuery("")}
                className="mt-2 text-xs text-blue-500 font-bold hover:underline"
              >
                검색 조건 초기화
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div>전체 항목: {(activeTab === "users" ? users : children).length}건</div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Real-time Sync Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
