"use client";

import { useState } from 'react';
import { Plus, Trash2, Search, CheckCircle2 } from 'lucide-react';
import { searchSchool } from '@/lib/neisApi';
import { supabase } from '@/lib/supabaseClient';

// 교육청 코드 맵핑 (일부 주요 교육청만 예시로 포함, 필요시 확장)
const OFFICE_CODES: Record<string, string> = {
  '서울': 'B10',
  '부산': 'C10',
  '대구': 'D10',
  '인천': 'E10',
  '광주': 'F10',
  '대전': 'G10',
  '울산': 'H10',
  '세종': 'I10',
  '경기': 'J10',
  '강원': 'K10',
  '충북': 'M10',
  '충남': 'N10',
  '전북': 'P10',
  '전남': 'Q10',
  '경북': 'R10',
  '경남': 'S10',
  '제주': 'T10',
};

interface ChildInfo {
  id: string;
  name: string;
  officeOfEducation: string;
  schoolName: string;
  grade: string;
  classNumber: string;
  schoolCode?: string;
  officeCode?: string;
  isVerified: boolean;
}

export default function SignupForm() {
  const [formData, setFormData] = useState({
    username: '',
    parentName: '',
    password: '',
    confirmPassword: '',
  });

  const [children, setChildren] = useState<ChildInfo[]>([
    { id: '1', name: '', officeOfEducation: '경기', schoolName: '', grade: '1', classNumber: '1', isVerified: false }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleChildChange = (id: string, field: keyof ChildInfo, value: string) => {
    setChildren(prev => prev.map(child => {
      if (child.id === id) {
        const updated = { ...child, [field]: value };
        // 학교 정보나 교육청이 바뀌면 인증 상태 초기화
        if (field === 'schoolName' || field === 'officeOfEducation') {
          updated.isVerified = false;
          updated.schoolCode = undefined;
          updated.officeCode = undefined;
        }
        return updated;
      }
      return child;
    }));
  };

  const addChild = () => {
    const newId = Date.now().toString();
    setChildren(prev => [
      ...prev,
      { id: newId, name: '', officeOfEducation: '경기', schoolName: '', grade: '1', classNumber: '1', isVerified: false }
    ]);
  };

  const removeChild = (id: string) => {
    if (children.length > 1) {
      setChildren(prev => prev.filter(child => child.id !== id));
    }
  };

  const verifySchool = async (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (!child || !child.schoolName) {
      alert('학교명을 입력해주세요.');
      return;
    }

    const officeCode = OFFICE_CODES[child.officeOfEducation];
    if (!officeCode) {
      alert('유효하지 않은 교육청입니다.');
      return;
    }

    setIsLoading(true);
    try {
      // API 호출하여 학교 검색
      const results = await searchSchool(officeCode, child.schoolName);
      
      if (results && results.length > 0) {
        // 첫 번째 결과 사용 (실제로는 모달로 선택하게 할 수도 있음)
        const schoolInfo = results[0];
        setChildren(prev => prev.map(c => c.id === childId ? {
          ...c,
          isVerified: true,
          schoolCode: schoolInfo.SD_SCHUL_CODE,
          officeCode: schoolInfo.ATPT_OFCDC_SC_CODE,
          schoolName: schoolInfo.SCHUL_NM // 공식 명칭으로 업데이트
        } : c));
        alert(`${schoolInfo.SCHUL_NM}이(가) 확인되었습니다.`);
      } else {
        alert('학교를 찾을 수 없습니다. 초등학교의 정확한 이름을 입력해주세요. (예: 매원초등학교)');
      }
    } catch (err) {
      alert('학교 검색 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 자녀 학교 인증 확인
    const unverifiedChild = children.find(c => !c.isVerified);
    if (unverifiedChild) {
      setErrorMsg('모든 자녀의 학교 인증을 완료해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      // 1. school_user 테이블에 사용자 정보 삽입
      const { error: userError } = await supabase
        .from('school_user')
        .insert({
          id: formData.username,
          password: formData.password,
          user_name: formData.parentName,
        });

      if (userError) {
        console.error('User insert error:', userError);
        // 이미 존재하는 아이디 처리 등
        if (userError.code === '23505') {
          setErrorMsg('이미 존재하는 아이디입니다.');
        } else {
          setErrorMsg('회원 정보 저장 중 오류가 발생했습니다.');
        }
        setIsLoading(false);
        return;
      }

      const babyInsertData = children.map(child => ({
        baby_name: child.name,
        baby_grade: child.grade,
        baby_class: child.classNumber,
        baby_office: child.officeOfEducation,
        baby_school: child.schoolName,
        parents_id: formData.username,
      }));

      const { error: babyError } = await supabase
        .from('user_baby')
        .insert(babyInsertData);

      if (babyError) {
        console.error('Baby insert error:', babyError);
        setErrorMsg('자녀 정보 저장 중 오류가 발생했습니다.');
        setIsLoading(false);
        return;
      }

      alert('회원가입이 완료되었습니다!');
      // window.location.href = '/'; // 필요 시 메인으로 이동
    } catch (err) {
      console.error('Signup error:', err);
      setErrorMsg('회원가입 처리 중 예기치 않은 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 glass rounded-3xl shadow-xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          스쿨 보드 회원가입
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          학부모 및 자녀 정보를 입력해주세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 기본 정보 */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center mb-4">
            <span className="w-1.5 h-6 bg-blue-500 rounded-full mr-2 inline-block"></span>
            기본 정보
          </h2>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">아이디</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="아이디를 입력하세요"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">학부모 이름</label>
              <input
                type="text"
                name="parentName"
                required
                value={formData.parentName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="홍길동"
              />
            </div>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">비밀번호</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="비밀번호"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">비밀번호 확인</label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                placeholder="비밀번호 확인"
              />
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-200 dark:bg-slate-700" />

        {/* 자녀 정보 */}
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center">
              <span className="w-1.5 h-6 bg-emerald-500 rounded-full mr-2 inline-block"></span>
              자녀 정보 등록
            </h2>
            <button
              type="button"
              onClick={addChild}
              className="flex items-center text-sm px-3 py-1.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              자녀 추가
            </button>
          </div>

          {children.map((child, index) => (
            <div key={child.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-700 relative group transition-all hover:shadow-md">
              {children.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeChild(child.id)}
                  className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              <h3 className="text-sm font-medium text-slate-500 mb-4">자녀 {index + 1}</h3>
              
              <div className="space-y-4">
                {/* Row 1: Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">자녀 이름</label>
                    <input
                      type="text"
                      required
                      value={child.name}
                      onChange={(e) => handleChildChange(child.id, 'name', e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                      placeholder="이름"
                    />
                  </div>
                </div>
                
                {/* Row 2: Grade and Class */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">학년</label>
                    <select
                      value={child.grade}
                      onChange={(e) => handleChildChange(child.id, 'grade', e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                    >
                      {[1, 2, 3, 4, 5, 6].map(g => (
                        <option key={g} value={g}>{g}학년</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">반</label>
                    <select
                      value={child.classNumber}
                      onChange={(e) => handleChildChange(child.id, 'classNumber', e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                    >
                      {Array.from({ length: 15 }, (_, i) => i + 1).map(c => (
                        <option key={c} value={c}>{c}반</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3: Office and School */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">시도교육청</label>
                    <select
                      value={child.officeOfEducation}
                      onChange={(e) => handleChildChange(child.id, 'officeOfEducation', e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                    >
                      {Object.keys(OFFICE_CODES).map(office => (
                        <option key={office} value={office}>{office}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">학교명 (초등학교)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={child.schoolName}
                        onChange={(e) => handleChildChange(child.id, 'schoolName', e.target.value)}
                        className={`flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border bg-white dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all ${
                          child.isVerified ? 'border-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.2)]' : 'border-slate-200 dark:border-slate-700'
                        }`}
                        placeholder="예: 서울초등학교"
                      />
                      <button
                        type="button"
                        onClick={() => verifySchool(child.id)}
                        disabled={isLoading || child.isVerified}
                        className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center min-w-[50px] sm:min-w-[70px] transition-all ${
                          child.isVerified 
                            ? 'bg-emerald-500 text-white cursor-default'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {child.isVerified ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {child.isVerified && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center mt-1">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> 인증 완료
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-70"
            disabled={isLoading}
          >
            가입하기
          </button>
        </div>
      </form>
    </div>
  );
}
