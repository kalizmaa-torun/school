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
  login: (userData: UserData, childrenData: ChildData[]) => void;
  logout: () => void;
  setSelectedChildIndex: (index: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      children: [],
      selectedChildIndex: 0,
      
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
    }),
    {
      name: 'school-auth-storage', // localStorage에 저장될 키 이름
      storage: createJSONStorage(() => localStorage), // (선택) sessionStorage로 변경 가능
    }
  )
);
