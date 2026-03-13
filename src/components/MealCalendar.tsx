"use client";

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getMonthlyMealInfo } from '@/lib/neisApi';
import { MealData } from '@/types';
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon, Utensils } from 'lucide-react';

export default function MealCalendar() {
  const { user, children, selectedChildIndex } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mealData, setMealData] = useState<MealData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const activeChild = children[selectedChildIndex];

  useEffect(() => {
    if (!activeChild) return;

    const fetchMeals = async () => {
      setIsLoading(true);
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const yearMonth = `${year}${month}`;

      try {
        const officeCode = activeChild.officeCode || 'J10';
        const schoolCode = activeChild.schoolCode || '7642152';
        const data = await getMonthlyMealInfo(officeCode, schoolCode, yearMonth);
        setMealData(data);
      } catch (error) {
        console.error("Failed to fetch meals", error);
        setMealData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeals();
  }, [activeChild, currentDate]);

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // 달력 생성을 위한 유틸리티
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getDayOfWeek = (year: number, month: number, day: number) => {
    return new Date(year, month, day).getDay();
  };

  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startDay = firstDayOfMonth.getDay(); // 0: 일, 1: 월, ..., 6: 토

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);

  // 날짜별 급식 데이터 매핑
  const mealMap = mealData.reduce((acc, meal) => {
    const day = parseInt(meal.date.split('-')[2]);
    acc[day] = meal;
    return acc;
  }, {} as Record<number, MealData>);

  const calendarDays = [];
  
  // 첫 주 빈 칸 처리 (월~금만 표시하므로 월요일(1) 기준)
  // 만약 1일이 일요일(0)이면 월요일 자리에 아무것도 안 넣거나 빈 칸 조절 필요
  // 여기서는 평일(1~5)만 보여주므로 logic을 단순화합니다.
  
  for (let day = 1; day <= daysInMonth; day++) {
    const dayOfWeek = getDayOfWeek(year, month, day);
    
    // 주말(토:6, 일:0)은 건너뜀
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const meal = mealMap[day];
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

    // 월요일인 경우 첫 주에 빈 칸 삽입 (시작 요일 맞추기)
    if (day === 1 || (day < 7 && calendarDays.length === 0)) {
      const padding = dayOfWeek - 1; // 월요일(1) 기준이므로
      for (let p = 0; p < padding; p++) {
        calendarDays.push(<div key={`empty-${day}-${p}`} className="h-52 bg-slate-50/10 dark:bg-slate-900/5"></div>);
      }
    }

    calendarDays.push(
      <div key={day} className={`h-52 p-2 flex flex-col gap-1 transition-all group ${isToday ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}>
        <div className="flex justify-between items-center mb-1">
          <span className={`text-base font-bold ${isToday ? 'w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30' : 'text-slate-600 dark:text-slate-400'}`}>
            {day}
          </span>
          {meal && (
            <span className="text-xs text-blue-600 dark:text-blue-400 font-black tracking-tighter bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-800">
              {meal.kcal}
            </span>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {meal ? (
            <div className="flex flex-col gap-1 bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              {meal.menu.map((item, idx) => (
                <div key={idx} className="text-[12px] text-slate-700 dark:text-slate-200 leading-[1.3] font-medium">
                  <span className="text-blue-500 mr-1">•</span>
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center opacity-10">
              <Utensils size={32} className="text-slate-300" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-4xl p-8 shadow-2xl relative overflow-hidden transition-all duration-300 hover:shadow-blue-500/5">
      {/* 배경 장식 */}
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -z-10" />
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full -z-10" />
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 rotate-3 group-hover:rotate-0 transition-transform">
            <Utensils size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tight">급식 메뉴</h2>
            <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {activeChild?.baby_school || '학교를 선택해주세요'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-2 rounded-2xl border border-slate-200 dark:border-white/10">
          <button 
            onClick={prevMonth}
            className="p-2.5 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all hover:shadow-sm active:scale-90"
          >
            <ChevronLeft size={22} className="text-slate-600 dark:text-slate-400" />
          </button>
          <div className="flex items-center gap-3 px-6 py-1 min-w-[160px] justify-center bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <CalendarIcon size={20} className="text-blue-500" />
            <span className="font-black text-xl tabular-nums tracking-tighter text-slate-800 dark:text-slate-100">
              {year}. {String(month + 1).padStart(2, '0')}
            </span>
          </div>
          <button 
            onClick={nextMonth}
            className="p-2.5 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all hover:shadow-sm active:scale-90"
          >
            <ChevronRight size={22} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[3px] z-20 flex items-center justify-center rounded-3xl">
            <div className="flex flex-col items-center gap-4 text-blue-600">
              <div className="relative">
                <Loader2 className="w-14 h-14 animate-spin" />
                <Utensils className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-400" />
              </div>
              <p className="font-black text-lg">오늘의 맛있는 메뉴를 불러오는 중...</p>
            </div>
          </div>
        )}

        <div className="border border-slate-300 dark:border-slate-700 rounded-[1.5rem] overflow-hidden bg-slate-50/30 dark:bg-slate-900/20 shadow-inner">
          <div className="grid grid-cols-5 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-300 dark:border-slate-700 rounded-t-[1.4rem]">
            {['월요일', '화요일', '수요일', '목요일', '금요일'].map((d) => (
              <div key={d} className="py-4 text-center text-sm font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-5 divide-x divide-y divide-slate-300 dark:divide-slate-700">
            {calendarDays}
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-slate-100/50 dark:bg-slate-800/30 rounded-2xl flex flex-wrap items-center gap-6 text-[13px] text-slate-500 font-medium border border-dashed border-slate-300 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-blue-600 shadow-md shadow-blue-500/30" />
          오늘
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-white border border-slate-300" />
          평일 식단
        </div>
        <div className="text-slate-400 ml-auto hidden md:block">
          * 식단은 학교 사정에 따라 변경될 수 있습니다. (숫자)는 알레르기 정보입니다.
        </div>
      </div>
    </div>
  );
}
