"use client";

import WeeklySchedule from '@/components/WeeklySchedule';
import TaskBoard from '@/components/TaskBoard';
import TodaySchedule from '@/components/TodaySchedule';
import { getWeeklyTimetable } from '@/lib/neisApi';
import { DayOfWeek, ClassSchedule } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function getWeekDateRange() {
  const now = new Date();
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
        
        const { startDate, endDate } = getWeekDateRange();
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
  }, [_hasHydrated, user, activeChild, router]);

  if (!_hasHydrated || user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-slate-500 font-medium animate-pulse">잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }

  const days: DayOfWeek[] = ['일', '월', '화', '수', '목', '금', '토'] as any;
  const now = new Date();
  const todayDayOfWeek = days[now.getDay()];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">안녕하세요, 반가워요 👋</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">오늘의 스케줄과 주간 시간표, 과제를 확인하세요.</p>
        </div>
        <div className="text-sm font-medium px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg whitespace-nowrap">
          {now.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 주간 시간표 */}
        <div className="lg:col-span-3 glass rounded-2xl p-6 min-h-[400px] flex flex-col relative">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <span className="w-2 h-6 bg-blue-500 rounded-full mr-3 inline-block"></span>
            주간 시간표 {activeChild ? `(${activeChild.baby_school} ${activeChild.baby_grade}-${activeChild.baby_class})` : ''}
          </h2>
          <div className="flex-1 min-h-[500px] relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded-xl z-10 backdrop-blur-sm">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : weekSchedules.length > 0 ? (
              <WeeklySchedule schedules={weekSchedules} />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                시간표 데이터가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 사이드 위젯 그룹 */}
        <div className="flex flex-col space-y-6">
          <div className="glass rounded-2xl p-6 flex-1 max-h-[600px] flex flex-col hide-scrollbar relative">
            <h2 className="text-lg font-bold mb-4 flex items-center shrink-0">
              <span className="w-2 h-6 bg-emerald-500 rounded-full mr-3 inline-block"></span>
              오늘의 수업
            </h2>
            <div className="flex-1 relative overflow-y-auto custom-scrollbar pr-1">
              {isLoading ? (
                 <div className="absolute inset-0 flex items-center justify-center">
                   <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                 </div>
              ) : (
                <TodaySchedule schedules={weekSchedules} dayOfWeek={todayDayOfWeek} />
              )}
            </div>
          </div>

          <div className="glass rounded-2xl p-6 flex-1 flex flex-col hide-scrollbar">
            <h2 className="text-lg font-bold mb-4 flex items-center shrink-0">
              <span className="w-2 h-6 bg-purple-500 rounded-full mr-3 inline-block"></span>
              해야 할 과제
            </h2>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              <TaskBoard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
