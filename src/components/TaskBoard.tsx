"use client";

import { useMemo } from 'react';
import { mockTasks } from '@/lib/mockData';
import { Task, TaskStatus } from '@/types';
import { Clock, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

const statusConfig: Record<TaskStatus, { label: string, color: string, icon: any }> = {
  TODO: { label: '할 일', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700', icon: Clock },
  IN_PROGRESS: { label: '진행 중', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800', icon: AlertCircle },
  DONE: { label: '완료됨', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800', icon: CheckCircle2 },
};

const priorityColor: Record<string, string> = {
  High: 'text-red-500 bg-red-50 dark:bg-red-500/10',
  Medium: 'text-orange-500 bg-orange-50 dark:bg-orange-500/10',
  Low: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10',
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
  // Sort tasks by due date
  const sortedTasks = useMemo(() => {
    return [...mockTasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, []);

  return (
    <div className="flex flex-col h-full space-y-3 overflow-y-auto pr-1">
      {sortedTasks.map((task) => {
        const config = statusConfig[task.status];
        const Icon = config.icon;
        
        return (
          <div 
            key={task.id} 
            className="flex flex-col p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-inner)] hover:bg-[var(--surface)] transition-all group"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.color}`}>
                  {config.label}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityColor[task.priority]}`}>
                  {task.priority}
                </span>
              </div>
              <div className="text-xs font-medium text-slate-500 flex items-center bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                <Calendar size={12} className="mr-1.5" />
                <span className={formatDate(task.dueDate).includes('D-') || formatDate(task.dueDate).includes('오늘') ? 'text-red-500 dark:text-red-400 font-bold' : ''}>
                  {formatDate(task.dueDate)}
                </span>
              </div>
            </div>
            
            <h3 className="text-sm font-semibold text-[var(--foreground)] leading-tight mb-1 group-hover:text-[var(--primary)] transition-colors">
              {task.title}
            </h3>
            
            <div className="flex items-center justify-between mt-auto pt-2">
              <span className="text-xs text-slate-500 font-medium bg-[var(--background)] px-2 py-1 rounded-md">
                {task.courseName}
              </span>
              <Icon size={16} className={task.status === 'DONE' ? 'text-emerald-500' : 'text-slate-400'} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
