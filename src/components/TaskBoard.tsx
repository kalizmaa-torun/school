"use client";

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/authStore';
import { Homework, TaskStatus } from '@/types';
import { Clock, Calendar, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const statusConfig: Record<TaskStatus, { label: string, color: string, icon: any }> = {
  TODO: { label: '할 일', color: 'bg-stone-100 text-stone-700 border-stone-200', icon: Clock },
  IN_PROGRESS: { label: '진행 중', color: 'bg-orange-50 text-orange-700 border-orange-200', icon: AlertCircle },
  DONE: { label: '완료됨', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: CheckCircle2 },
};

const priorityColor: Record<string, string> = {
  High: 'text-red-500 bg-red-50',
  Medium: 'text-orange-500 bg-orange-50',
  Low: 'text-stone-500 bg-stone-50',
};

function formatDate(isoString: string) {
  const date = new Date(isoString);
  const now = new Date();
  
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '오늘 마감';
  if (diffDays === 1) return '내일 마감';
  if (diffDays < 0) return '기한 지남';
  if (diffDays <= 7) return `D-${diffDays}`;
  
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export default function TaskBoard() {
  const { user, children, selectedChildIndex } = useAuthStore();
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const activeChild = children[selectedChildIndex];

  useEffect(() => {
    const fetchHomeworks = async () => {
      if (!user || !activeChild) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("homework")
          .select("*")
          .eq("user_id", user.id)
          .eq("child_id", activeChild.id)
          .neq("status", "DONE")
          .order("due_date", { ascending: true })
          .limit(5);

        if (error) throw error;
        setHomeworks(data || []);
      } catch (error) {
        console.error("Failed to fetch homeworks for board:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeworks();
  }, [user, activeChild]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (homeworks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-4 text-stone-400">
        <CheckCircle2 size={24} className="mb-1.5 opacity-50 text-orange-500" />
        <p className="text-xs font-medium">현재 진행 중인 숙제가 없어요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {homeworks.map((hw) => {
        const config = statusConfig[hw.status];
        const Icon = config.icon;
        
        return (
          <div 
            key={hw.id} 
            className="flex flex-col p-4 rounded-xl border border-[var(--border)] bg-white hover:bg-stone-50 transition-all group"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.color}`}>
                  {config.label}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColor[hw.priority]}`}>
                  {hw.priority}
                </span>
              </div>
              <div className="text-xs font-medium text-stone-500 flex items-center bg-stone-50 px-2 py-1 rounded-md">
                <Calendar size={12} className="mr-1.5" />
                <span className={formatDate(hw.due_date).includes('D-') || formatDate(hw.due_date).includes('오늘') ? 'text-red-500 font-bold' : ''}>
                  {formatDate(hw.due_date)}
                </span>
              </div>
            </div>
            
            <h3 className="text-sm font-semibold text-stone-800 leading-tight mb-1 group-hover:text-[var(--primary)] transition-colors">
              {hw.title}
            </h3>
            
            <div className="flex items-center justify-between mt-auto pt-2">
              <span className="text-xs text-stone-500 font-medium bg-stone-100 px-2 py-1 rounded-md">
                {hw.subject}
              </span>
              <Icon size={16} className="text-stone-400" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
