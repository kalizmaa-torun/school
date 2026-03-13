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

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // 날짜별 급식 데이터 매핑
  const mealMap = mealData.reduce((acc, meal) => {
    const day = parseInt(meal.date.split('-')[2]);
    acc[day] = meal;
    return acc;
  }, {} as Record<number, MealData>);

  const calendarDays = [];
  // 이전 달 빈 칸
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="h-32 border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10"></div>);
  }

  // 이번 달 일자
  for (let day = 1; day <= daysInMonth; day++) {
    const meal = mealMap[day];
    const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

    calendarDays.push(
      <div key={day} className={`h-40 border border-slate-100 dark:border-slate-800 p-2 flex flex-col gap-1 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/20 ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
        <div className="flex justify-between items-start">
          <span className={`text-sm font-semibold ${isToday ? 'w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center' : 'text-slate-600 dark:text-slate-400'}`}>
            {day}
          </span>
          {meal && <span className="text-[10px] text-blue-500 font-medium">{meal.kcal}</span>}
        </div>
        
        <div className="flex-1 overflow-y-auto mt-1 custom-scrollbar">
          {meal ? (
            <div className="flex flex-col gap-0.5">
              {meal.menu.map((item, idx) => (
                <div key={idx} className="text-[11px] text-slate-700 dark:text-slate-300 leading-tight">
                  • {item}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center opacity-10">
              <Utensils size={24} className="text-slate-300" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-6 shadow-xl relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[60px] rounded-full -z-10" />
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
            <Utensils size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">급식 메뉴</h2>
            <p className="text-sm text-slate-500">{activeChild?.baby_school || '학교를 선택해주세요'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
          <button 
            onClick={prevMonth}
            className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all hover:shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2 px-4 min-w-[140px] justify-center">
            <CalendarIcon size={18} className="text-slate-400" />
            <span className="font-bold text-lg tabular-nums">
              {year}. {String(month + 1).padStart(2, '0')}
            </span>
          </div>
          <button 
            onClick={nextMonth}
            className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all hover:shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-2xl">
            <div className="flex flex-col items-center gap-3 text-blue-600">
              <Loader2 className="w-10 h-10 animate-spin" />
              <p className="font-medium">식단표를 가져오는 중...</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-7 border-t border-l border-slate-100 dark:border-slate-800 rounded-t-xl overflow-hidden">
          {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
            <div key={d} className={`py-4 text-center text-sm font-bold border-b border-r border-slate-100 dark:border-slate-800 ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-slate-500'}`}>
              {d}
            </div>
          ))}
          {calendarDays}
        </div>
      </div>
      
      <div className="mt-6 flex flex-wrap gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          오늘
        </div>
        <p>* 식단은 학교 사정에 따라 변경될 수 있습니다.</p>
        <p>* (숫자)는 알레르기 유발 정보입니다.</p>
      </div>
    </div>
  );
}
