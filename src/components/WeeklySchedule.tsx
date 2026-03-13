"use client";

import { useMemo, useEffect, useRef } from 'react';
import { ClassSchedule, DayOfWeek } from '@/types';
import { 
  BookOpen, 
  Calculator, 
  FlaskConical, 
  Palette, 
  Trophy, 
  Music, 
  Languages, 
  Globe, 
  Heart, 
  Sparkles, 
  Hammer, 
  HelpCircle,
  Clapperboard
} from 'lucide-react';

const DAYS: DayOfWeek[] = ['월', '화', '수', '목', '금'];

// Tailwind color maps
const colorMap: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30',
  purple: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30',
  orange: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-500/30',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30',
  rose: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30',
};

const defaultColor = 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

const getSubjectIcon = (name: string) => {
  if (name.includes('국어')) return <BookOpen size={16} />;
  if (name.includes('수학')) return <Calculator size={16} />;
  if (name.includes('과학')) return <FlaskConical size={16} />;
  if (name.includes('미술')) return <Palette size={16} />;
  if (name.includes('체육')) return <Trophy size={16} />;
  if (name.includes('영어') || name.includes('영어특화')) return <Languages size={14} />;
  if (name.includes('사회')) return <Globe size={16} />;
  if (name.includes('음악')) return <Music size={16} />;
  if (name.includes('도덕')) return <Heart size={16} />;
  if (name.includes('실과')) return <Hammer size={16} />;
  if (name.includes('창체') || name.includes('창의')) return <Sparkles size={16} />;
  if (name.includes('컴퓨터') || name.includes('코딩')) return <Calculator size={16} />;
  if (name.includes('방송')) return <Clapperboard size={16} />;
  return <HelpCircle size={16} />;
};

function timeToMinutes(timeStr: string) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

interface WeeklyScheduleProps {
  schedules: ClassSchedule[];
}

export default function WeeklySchedule({ schedules }: WeeklyScheduleProps) {
  const periods = useMemo(() => {
    const map = new Map();
    schedules.forEach(s => {
      // professor is something like "1교시"
      map.set(s.startTime, { start: s.startTime, end: s.endTime, label: s.professor });
    });
    
    if (map.size === 0) {
      return [
        { start: '09:00', end: '09:40', label: '1교시' },
        { start: '09:50', end: '10:30', label: '2교시' },
        { start: '10:40', end: '11:20', label: '3교시' },
        { start: '11:30', end: '12:10', label: '4교시' },
        { start: '13:00', end: '13:40', label: '5교시' },
        { start: '13:50', end: '14:30', label: '6교시' },
      ];
    }
    
    return Array.from(map.values()).sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
  }, [schedules]);

  const now = new Date();
  const daysKR = ['일', '월', '화', '수', '목', '금', '토'];
  const todayKR = daysKR[now.getDay()];
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (todayRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const target = todayRef.current;
      
      // 약간의 지연 후 스크롤 처리 (렌더링 완료 보장)
      const timer = setTimeout(() => {
        container.scrollTo({
          left: target.offsetLeft - 100, // 좌측에 여백을 조금 둠
          behavior: 'smooth'
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div 
      ref={scrollContainerRef}
      className="w-full h-full overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface-inner)] custom-scrollbar"
    >
      <div className="min-w-[600px] flex flex-col">
        {/* Header (Days) */}
        <div className="flex border-b border-[var(--border)] sticky top-0 bg-[var(--surface-inner)] z-30">
          <div className="w-20 border-r border-[var(--border)] bg-[var(--surface-inner)] flex-shrink-0 sticky left-0 z-40 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]"></div>
          {DAYS.map(day => {
            const isToday = day === todayKR;
            return (
              <div 
                key={day} 
                ref={isToday ? todayRef : null}
                className={`flex-1 text-center py-3 font-semibold text-sm transition-colors ${
                  isToday 
                    ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20" 
                    : "text-[var(--foreground)]"
                }`}
              >
                {day}요일
              </div>
            );
          })}
        </div>

        {/* Body (Grid) */}
        <div className="flex flex-col bg-[var(--surface)]">
          {periods.map(period => (
            <div key={period.start} className="flex border-b border-[var(--border)] min-h-[100px]">
              {/* Time axis */}
              <div className="w-20 flex-shrink-0 flex flex-col items-center justify-center border-r border-[var(--border)] bg-[var(--surface-inner)] py-2 sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
                <span className="font-bold text-sm text-[var(--foreground)]">{period.label}</span>
                <span className="text-[11px] mt-1 text-slate-500 font-medium">{period.start}</span>
                <span className="text-[11px] text-slate-500 font-medium">~ {period.end}</span>
              </div>

              {/* Day Columns */}
              <div className="flex-1 flex">
                {DAYS.map((day, idx) => {
                  const classesOfDay = schedules.filter(s => s.day === day && s.startTime === period.start);
                  
                  return (
                    <div 
                      key={day} 
                      className={`flex-1 p-2 transition-colors ${
                        day === todayKR ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                      } ${idx < DAYS.length - 1 ? 'border-r border-[var(--border)]/50' : ''}`}
                    >
                      {classesOfDay.map(schedule => (
                        <div
                          key={schedule.id}
                          className={`w-full h-full min-h-[70px] border rounded-xl p-2.5 shadow-sm flex flex-col justify-center items-center text-center transition-transform hover:scale-[1.02] hover:shadow-md cursor-pointer ${colorMap[schedule.color] || defaultColor}`}
                        >
                          <div className="mb-1.5 opacity-80">
                            {getSubjectIcon(schedule.name)}
                          </div>
                          <div className="font-bold text-[13px] md:text-sm leading-tight break-keep">{schedule.name}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
