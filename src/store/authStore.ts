import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface ChildData {
  id?: number;
  baby_name: string;
  baby_grade: string;
  baby_class: string;
  baby_office: string;
  baby_school: string;
  parents_id: string;
  // Supabase에 저장하지 않았다면 프론트에서 임시로 고정 코드를 쓰되 나중에 확장
  schoolCode?: string; 
  officeCode?: string; 
}

interface UserData {
  id: string;
  user_name: string;
}

interface AuthState {
  user: UserData | null;
  children: ChildData[];
  selectedChildIndex: number;
  _hasHydrated: boolean;
  login: (userData: UserData, childrenData: ChildData[]) => void;
  logout: () => void;
  setSelectedChildIndex: (index: number) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      children: [],
      selectedChildIndex: 0,
      _hasHydrated: false,
      
      login: (userData, childrenData) => set({ 
        user: userData, 
        children: childrenData,
        selectedChildIndex: 0 // 로그인 시 기본적으로 첫 번째 자녀 선택
      }),
      
      logout: () => set({ 
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
    }),
    {
      name: 'school-auth-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (state) => {
        return () => {
          state.setHasHydrated(true);
        };
      },
    }
  )
);
