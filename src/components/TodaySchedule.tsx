"use client";

import { ClassSchedule, DayOfWeek } from '@/types';
import { Clock } from 'lucide-react';

interface TodayScheduleProps {
  schedules: ClassSchedule[];
  dayOfWeek: DayOfWeek;
}

const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30',
  purple: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
  orange: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30',
  rose: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30',
};

export default function TodaySchedule({ schedules, dayOfWeek }: TodayScheduleProps) {
  const todayClasses = schedules
    .filter((s) => s.day === dayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (todayClasses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-400">
        <Clock size={32} className="mb-2 opacity-50" />
        <p className="text-sm">오늘의 수업 일정이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3 overflow-y-auto pr-1">
      {todayClasses.map((cls) => {
        const clsColors = colorMap[cls.color] || colorMap['blue'];
        
        return (
          <div 
            key={cls.id}
            className={`flex items-center p-3 rounded-xl border ${clsColors} transition-transform hover:scale-[1.02]`}
          >
            <div className="flex-shrink-0 w-12 text-center mr-3 font-semibold text-sm opacity-90">
              {cls.professor}
            </div>
            <div className="flex flex-col flex-grow truncate">
              <span className="font-bold text-sm truncate">{cls.name}</span>
              <span className="text-xs opacity-80 mt-0.5 truncate flex items-center">
                <Clock size={10} className="mr-1" />
                {cls.startTime} - {cls.endTime}
              </span>
            </div>
            <div className="flex-shrink-0 text-xs font-medium px-2 py-1 bg-white/40 dark:bg-black/20 rounded-md">
              {cls.room}
            </div>
          </div>
        );
      })}
    </div>
  );
}
