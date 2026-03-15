import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Session, User } from '@supabase/supabase-js';

export interface ChildData {
  id?: number;
  baby_name: string;
  baby_grade: string;
  baby_class: string;
  baby_office: string;
  baby_school: string;
  parents_id: string;
  schoolCode?: string; 
  officeCode?: string; 
}

interface AuthState {
  session: Session | null;
  user: User | null;
  isAuthLoading: boolean; // 추가
  children: ChildData[];
  selectedChildIndex: number;
  _hasHydrated: boolean;
  isMobileMenuOpen: boolean;
  setSession: (session: Session | null) => void;
  setChildren: (childrenData: ChildData[]) => void;
  logout: () => void;
  setSelectedChildIndex: (index: number) => void;
  setHasHydrated: (state: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      isAuthLoading: true, // 초기값 true
      children: [],
      selectedChildIndex: 0,
      _hasHydrated: false,
      isMobileMenuOpen: false,
      
      setSession: (session) => set({ 
        session,
        user: session?.user ?? null,
        isAuthLoading: false // 세션 설정 완료 시 false
      }),

      setChildren: (childrenData) => set({
        children: childrenData
      }),
      
      logout: () => set({ 
        session: null,
        user: null, 
        children: [], 
        selectedChildIndex: 0 
      }),
      
      setSelectedChildIndex: (index) => set({ 
        selectedChildIndex: index 
      }),
      setHasHydrated: (state) => set({ 
        _hasHydrated: state 
      }),
      setMobileMenuOpen: (open) => set({ 
        isMobileMenuOpen: open 
      }),
    }),
    {
      name: 'school-auth-storage',
      storage: createJSONStorage(() => localStorage),
      // 세션과 유저 정보는 Supabase Auth에서 직접 관리하므로 
      // 로컬스토리지에는 자녀 정보와 설정값만 유지하는 것이 보안상 유리할 수 있으나,
      // 일단 기존 UI 호환성을 위해 유지는 하되 Supabase 세션 리스너가 주 제어권을 가집니다.
      partialize: (state) => ({ 
        children: state.children, 
        selectedChildIndex: state.selectedChildIndex 
      }),
      onRehydrateStorage: (state) => {
        return () => {
          state.setHasHydrated(true);
        };
      },
    }
  )
);
