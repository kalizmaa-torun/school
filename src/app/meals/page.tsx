import MealCalendar from '@/components/MealCalendar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '급식 메뉴 | 스쿨 보드',
  description: '아이의 월간 급식 메뉴를 확인하세요.',
};

export default function MealsPage() {
  return (
    <div className="space-y-6">
      <MealCalendar />
    </div>
  );
}
