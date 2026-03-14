"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Calendar, Clock, AlertCircle, CheckCircle2, Loader2, Save, X, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { Homework, TaskStatus, TaskPriority } from "@/types";

const statusConfig: Record<TaskStatus, { label: string, color: string, icon: any }> = {
  TODO: { label: '할 일', color: 'bg-stone-100 text-stone-700 border-stone-200', icon: Clock },
  IN_PROGRESS: { label: '진행 중', color: 'bg-orange-50 text-orange-700 border-orange-200', icon: AlertCircle },
  DONE: { label: '완료됨', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: CheckCircle2 },
};

const priorityConfig: Record<TaskPriority, { label: string, color: string }> = {
  High: { label: '높음', color: 'text-red-600 bg-red-50 border-red-100' },
  Medium: { label: '보통', color: 'text-orange-600 bg-orange-50 border-orange-100' },
  Low: { label: '낮음', color: 'text-stone-500 bg-stone-50 border-stone-100' },
};

export default function HomeworkPage() {
  const { user, children, selectedChildIndex } = useAuthStore();
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("Medium");

  const activeChild = children[selectedChildIndex];

  const fetchHomeworks = async () => {
    if (!user || !activeChild) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("homework")
        .select("*")
        .eq("user_id", user.id)
        .eq("child_id", activeChild.id)
        .order("due_date", { ascending: true });

      if (error) throw error;
      setHomeworks(data || []);
    } catch (error) {
      console.error("Failed to fetch homeworks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHomeworks();
  }, [user, activeChild]);

  const handleAddHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeChild || !title || !subject || !dueDate) return;

    setIsSubmitting(true);
    try {
      const childId = activeChild?.id;
      
      if (!childId) {
        throw new Error("자녀 정보가 선택되지 않았습니다. 자녀 정보를 먼저 등록해주세요.");
      }

      console.log("Adding homework payload:", {
        user_id: user.id,
        child_id: childId,
        title,
        subject,
        due_date: new Date(dueDate).toISOString(),
        priority,
        status: "TODO"
      });

      const { data, error } = await supabase.from("homework").insert({
        user_id: user.id,
        child_id: childId,
        title,
        subject,
        due_date: new Date(dueDate).toISOString(),
        priority,
        status: "TODO"
      }).select();

      if (error) {
        console.error("Supabase error detail:", error);
        throw error;
      }
      
      console.log("Homework added successfully:", data);
      setIsAdding(false);
      setTitle("");
      setSubject("");
      setDueDate("");
      setPriority("Medium");
      fetchHomeworks();
    } catch (error: any) {
      console.error("Detailed Error Object:", error);
      
      // 구체적인 오류 사유 추출
      const errorMessage = error.message || "알 수 없는 오류가 발생했습니다.";
      const errorCode = error.code || "N/A";
      const errorDetail = error.details || "상세 정보 없음";
      const errorHint = error.hint || "힌트 없음";

      console.error("Failed to add homework (Detailed):", {
        message: errorMessage,
        code: errorCode,
        details: errorDetail,
        hint: errorHint
      });

      alert(`숙제 등록에 실패했습니다.\n\n오류 내용: ${errorMessage}\n코드: ${errorCode}\n상세: ${errorDetail}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: TaskStatus) => {
    const nextStatus: TaskStatus = 
      currentStatus === "TODO" ? "IN_PROGRESS" : 
      currentStatus === "IN_PROGRESS" ? "DONE" : "TODO";

    try {
      const { error } = await supabase
        .from("homework")
        .update({ status: nextStatus })
        .eq("id", id);
      
      if (error) throw error;
      setHomeworks(prev => prev.map(h => h.id === id ? { ...h, status: nextStatus } : h));
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 숙제를 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase.from("homework").delete().eq("id", id);
      if (error) throw error;
      setHomeworks(prev => prev.filter(h => h.id !== id));
    } catch (error) {
      console.error("Failed to delete homework:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--primary)] rounded-xl shadow-lg shadow-[var(--primary)]/20">
            <BookOpen className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">숙제관리</h1>
            <p className="text-stone-500 text-sm">
              {activeChild ? `${activeChild.baby_name}의 숙제를 체크하세요` : "자녀의 숙제를 관리하세요"}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl transition-all font-bold shadow-lg shadow-[var(--primary)]/20 active:scale-95"
        >
          {isAdding ? <X size={18} /> : <Plus size={18} />}
          <span>{isAdding ? "취소" : "숙제 추가"}</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddHomework} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-900 ml-1">숙제 내용</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 영어 단어 외우기" 
                autoFocus
                className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] transition-all outline-none text-stone-900 font-medium placeholder:text-stone-400"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-900 ml-1">과목</label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="예: 영어, 수학" 
                className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] transition-all outline-none text-stone-900 font-medium placeholder:text-stone-400"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-900 ml-1">마감일</label>
              <input 
                type="date" 
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl focus:ring-2 focus:ring-[var(--primary)] transition-all outline-none text-stone-900 font-medium"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-900 ml-1">우선순위</label>
              <div className="flex gap-2">
                {(["High", "Medium", "Low"] as TaskPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-bold transition-all ${
                      priority === p 
                        ? priorityConfig[p].color + " border-current ring-2 ring-current ring-offset-2" 
                        : "bg-white border-stone-200 text-stone-500 hover:bg-stone-50"
                    }`}
                  >
                    {priorityConfig[p].label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-stone-900 hover:bg-black text-white rounded-xl transition-all font-bold shadow-lg disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              <span>숙제 저장하기</span>
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
            <p className="text-stone-600 font-bold">숙제 목록을 불러오는 중...</p>
          </div>
        ) : homeworks.length > 0 ? (
          homeworks.map((hw) => {
            const config = statusConfig[hw.status];
            const StatusIcon = config.icon;
            const priority = priorityConfig[hw.priority];

            return (
              <div key={hw.id} className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button 
                        onClick={() => handleStatusToggle(hw.id, hw.status)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all ${config.color}`}
                      >
                        <StatusIcon size={14} />
                        {config.label}
                      </button>
                      <span className={`px-3 py-1 rounded-full border text-xs font-bold ${priority.color}`}>
                        우선순위: {priority.label}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
                        <Calendar size={14} />
                        {formatDate(hw.due_date)}
                      </span>
                    </div>
                    <h3 className={`text-lg font-extrabold text-stone-900 ${hw.status === 'DONE' ? 'line-through opacity-40' : ''}`}>
                      {hw.title}
                    </h3>
                    <div className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-lg text-xs font-black border border-orange-200">
                      {hw.subject}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDelete(hw.id)}
                      className="p-2.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
            <CheckCircle2 className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500 font-bold text-lg">아직 등록된 숙제가 없습니다.</p>
            <p className="text-stone-400 text-sm mt-1">새로운 숙제를 추가하고 계획적으로 학습하세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}
