"use client";

import WeeklySchedule from '@/components/WeeklySchedule';
import TaskBoard from '@/components/TaskBoard';
import TodaySchedule from '@/components/TodaySchedule';
import { getWeeklyTimetable } from '@/lib/neisApi';
import { DayOfWeek, ClassSchedule } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, RotateCcw, Loader2 } from 'lucide-react';

function getWeekDateRange(weekOffset: number = 0) {
  const now = new Date();
  now.setDate(now.getDate() + (weekOffset * 7));
  const currentDay = now.getDay(); // 0(일) ~ 6(토)
  const diffToMon = currentDay === 0 ? -6 : 1 - currentDay;
  const diffToFri = currentDay === 0 ? -2 : 5 - currentDay;

  const startDate = new Date(now);
  startDate.setDate(now.getDate() + diffToMon);
  const endDate = new Date(now);
  endDate.setDate(now.getDate() + diffToFri);

  return { startDate, endDate };
}

export default function Home() {
  const router = useRouter();
  const { user, children, selectedChildIndex, _hasHydrated } = useAuthStore();
  const [weekSchedules, setWeekSchedules] = useState<ClassSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);

  const activeChild = children[selectedChildIndex];

  useEffect(() => {
    // 하이드레이션 완료 전에는 아무것도 하지 않음
    if (!_hasHydrated) return;

    // 마운트 후 유저가 없으면 로그인 페이지로 이동
    if (user === null) {
      router.push('/login');
      return;
    }

    const fetchSchedule = async () => {
      setIsLoading(true);
      if (activeChild) {
        const officeCode = activeChild.officeCode || 'J10'; 
        const schoolCode = activeChild.schoolCode || '7642152';
        
        const { startDate, endDate } = getWeekDateRange(weekOffset);
        try {
          const data = await getWeeklyTimetable(
            startDate, 
            endDate, 
            officeCode, 
            schoolCode, 
            activeChild.baby_grade, 
            activeChild.baby_class
          );
          setWeekSchedules(data);
        } catch (error) {
          console.error("Failed to load schedule", error);
          setWeekSchedules([]);
        }
      } else {
        setWeekSchedules([]);
      }
      setIsLoading(false);
    };

    fetchSchedule();
  }, [_hasHydrated, user, activeChild, router, weekOffset]);

  if (!_hasHydrated || user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" />
          <p className="text-stone-500 font-medium animate-pulse">잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }

  const days: DayOfWeek[] = ['일', '월', '화', '수', '목', '금', '토'] as any;
  const now = new Date();
  const todayDayOfWeek = days[now.getDay()];

  const { startDate, endDate } = getWeekDateRange(weekOffset);
  const formattedRange = `${startDate.getMonth() + 1}월 ${startDate.getDate()}일 - ${endDate.getMonth() + 1}월 ${endDate.getDate()}일`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">안녕하세요, 반가워요 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">오늘의 수업과 주간 시간표, 숙제를 확인하세요.</p>
        </div>
        <div className="flex justify-start lg:justify-end">
          <div className="text-sm font-bold px-5 py-2.5 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 rounded-xl shadow-sm border border-orange-200 dark:border-orange-500/30 whitespace-nowrap">
            {now.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 주간 시간표 */}
        <div className="lg:col-span-3 glass rounded-2xl p-6 flex flex-col relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-bold flex items-center shrink-0">
              <span className="w-2 h-6 bg-[var(--primary)] rounded-full mr-3 inline-block"></span>
              주간 시간표 {activeChild ? `(${activeChild.baby_school} ${activeChild.baby_grade}-${activeChild.baby_class})` : ''}
            </h2>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-xl p-1 border border-stone-200 dark:border-stone-700">
                <button 
                  onClick={() => setWeekOffset(prev => prev - 1)}
                  className="p-1.5 hover:bg-white dark:hover:bg-stone-700 rounded-lg transition-all text-stone-600 dark:text-stone-400"
                  aria-label="이전 주"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="px-3 py-1 text-sm font-bold text-stone-700 dark:text-stone-300 min-w-[140px] text-center">
                  {formattedRange}
                </div>
                <button 
                  onClick={() => setWeekOffset(prev => prev + 1)}
                  className="p-1.5 hover:bg-white dark:hover:bg-stone-700 rounded-lg transition-all text-stone-600 dark:text-stone-400"
                  aria-label="다음 주"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <button 
                onClick={() => setWeekOffset(0)}
                disabled={weekOffset === 0}
                className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-700 transition-all disabled:opacity-30 disabled:pointer-events-none"
              >
                <RotateCcw size={14} />
                <span>오늘</span>
              </button>
            </div>
          </div>

          <div className="flex-1 relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-stone-900/50 rounded-xl z-10 backdrop-blur-sm">
                <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
              </div>
            ) : weekSchedules.length > 0 ? (
              <WeeklySchedule schedules={weekSchedules} />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-500 border border-dashed border-stone-200 dark:border-stone-700 rounded-2xl bg-stone-50/50 dark:bg-stone-900/20">
                시간표 데이터가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 사이드 위젯 그룹 */}
        <div className="flex flex-col space-y-6">
          <div className="glass rounded-2xl p-6 min-h-[120px] max-h-[480px] flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-lg">
            <h2 className="text-lg font-bold mb-4 flex items-center shrink-0">
              <span className="w-2 h-6 bg-orange-500 rounded-full mr-3 inline-block"></span>
              오늘의 수업
            </h2>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
              {isLoading ? (
                 <div className="absolute inset-0 flex items-center justify-center">
                   <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                 </div>
              ) : (
                <TodaySchedule schedules={weekSchedules} dayOfWeek={todayDayOfWeek} />
              )}
            </div>
          </div>

          <div className="glass rounded-2xl p-6 min-h-[120px] max-h-[480px] flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-lg">
            <h2 className="text-lg font-bold mb-4 flex items-center shrink-0">
              <span className="w-2 h-6 bg-amber-500 rounded-full mr-3 inline-block"></span>
              해야 할 숙제
            </h2>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2">
              <TaskBoard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
