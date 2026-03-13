"use client";

import { Construction, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TasksPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 mb-8 animate-bounce">
        <Construction size={48} />
      </div>
      
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">
        과제 관리 서비스 개발 중
      </h1>
      
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-10 leading-relaxed">
        현재 더 편리한 과제 관리 기능을 열심히 준비하고 있습니다.<br />
        조금만 기다려주시면 멋진 기능으로 찾아뵙겠습니다!
      </p>
      
      <Link 
        href="/"
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 active:scale-95"
      >
        <ArrowLeft size={18} />
        대시보드로 돌아가기
      </Link>
    </div>
  );
}
