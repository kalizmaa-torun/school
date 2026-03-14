"use client";

import { ClassSchedule, DayOfWeek } from '@/types';
import { Clock } from 'lucide-react';
import { getSubjectIcon } from './WeeklySchedule';

interface TodayScheduleProps {
  schedules: ClassSchedule[];
  dayOfWeek: DayOfWeek;
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100/50 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30',
  purple: 'bg-purple-100/50 text-purple-800 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30',
  emerald: 'bg-emerald-100/50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
  orange: 'bg-orange-100/50 text-orange-800 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30',
  indigo: 'bg-indigo-100/50 text-indigo-800 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30',
  rose: 'bg-rose-100/50 text-rose-800 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30',
};

export default function TodaySchedule({ schedules, dayOfWeek }: TodayScheduleProps) {
  const todayClasses = schedules
    .filter((s) => s.day === dayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (todayClasses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
        <Clock size={32} className="mb-2 opacity-50" />
        <p className="text-sm font-medium">오늘의 수업 일정이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {todayClasses.map((cls) => {
        // 과목별 텍스트 색상 및 배경 색상 강화
        const clsColors = colorMap[cls.color] || colorMap['blue'];
        
        return (
          <div 
            key={cls.id}
            className={`flex items-center p-4 rounded-2xl border ${clsColors} transition-all duration-200 hover:scale-[1.02] hover:shadow-md group relative overflow-hidden`}
          >
            {/* 배경에 살짝 테마 색상 강조 */}
            <div className="absolute inset-0 bg-current opacity-[0.03] pointer-events-none"></div>
            
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-2xl bg-white/80 dark:bg-black/40 mr-4 shadow-sm group-hover:bg-white dark:group-hover:bg-black/60 transition-colors">
              {getSubjectIcon(cls.name)}
            </div>
            
            <div className="flex flex-col flex-grow truncate">
              <span className="font-extrabold text-[16px] tracking-tight truncate mb-0.5">
                {cls.name}
              </span>
              <div className="flex items-center text-xs font-semibold opacity-70">
                <Clock size={12} className="mr-1.5" />
                <span>{cls.startTime} - {cls.endTime}</span>
                <span className="mx-2 opacity-30">|</span>
                <span>{cls.room || cls.professor}</span>
              </div>
            </div>
            
            <div className="flex-shrink-0 ml-2 opacity-40 group-hover:opacity-100 transition-opacity">
              <span className="text-lg">→</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
