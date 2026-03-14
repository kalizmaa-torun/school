export type DayOfWeek = '월' | '화' | '수' | '목' | '금';

export interface ClassSchedule {
  id: string;
  name: string;
  professor: string;
  room: string;
  day: DayOfWeek;
  startTime: string; // e.g., "09:00"
  endTime: string;   // e.g., "10:30"
  color: string;     // Tailwind generic color name e.g. "blue", "purple", "emerald"
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface Task {
  id: string;
  title: string;
  courseName: string;
  dueDate: string; // ISO date string
  status: TaskStatus;
  priority: TaskPriority;
}

export interface Homework {
  id: string;
  user_id: string;
  child_id: number;
  title: string;
  subject: string;
  description?: string;
  due_date: string;
  status: TaskStatus;
  priority: TaskPriority;
  created_at?: string;
}

// NEIS 나이스 시간표 Open API 응답 타입 정의
export interface NeisTimetableRow {
  ATPT_OFCDC_SC_CODE: string;
  ATPT_OFCDC_SC_NM: string;
  SD_SCHUL_CODE: string;
  SCHUL_NM: string;
  AY: string;
  SEM: string;
  ALL_TI_YMD: string; // "20240312" 형식의 날짜 문자열
  GRADE: string;
  CLASS_NM: string;
  PERIO: string; // "1" ~ "6" 등 교시
  ITRT_CNTNT: string; // "국어", "수학" 등 과목명
}

export interface NeisTimetableResponse {
  elsTimetable?: [
    { head: { list_total_count: number; RESULT: { CODE: string; MESSAGE: string } }[] },
    { row: NeisTimetableRow[] }
  ];
  RESULT?: {
    CODE: string;
    MESSAGE: string;
  };
}

// NEIS 학교기본정보 Open API 응답 타입 정의
export interface NeisSchoolInfoRow {
  ATPT_OFCDC_SC_CODE: string;
  ATPT_OFCDC_SC_NM: string;
  SD_SCHUL_CODE: string;
  SCHUL_NM: string;
  ENG_SCHUL_NM: string;
  SCHUL_KND_SC_NM: string; // "초등학교", "중학교" 등
  ORG_RDNMA: string; // 도로명주소
}

export interface NeisSchoolInfoResponse {
  schoolInfo?: [
    { head: { list_total_count: number; RESULT: { CODE: string; MESSAGE: string } }[] },
    { row: NeisSchoolInfoRow[] }
  ];
  RESULT?: {
    CODE: string;
    MESSAGE: string;
  };
}

// NEIS 급식 정보 Open API 응답 타입 정의
export interface NeisMealRow {
  ATPT_OFCDC_SC_CODE: string;
  ATPT_OFCDC_SC_NM: string;
  SD_SCHUL_CODE: string;
  SCHUL_NM: string;
  MMEAL_SC_CODE: string; // "1" 조식, "2" 중식, "3" 석식
  MMEAL_SC_NM: string;   // "중식" 등
  MLSV_YMD: string;     // "20240312"
  MLSV_FGR: string | number;     // 급식인원
  DDISH_NM: string;     // 요리명 (HTML 태그 및 칼로리 포함)
  ORGRT_INFO: string;   // 원산지정보
  CAL_INFO: string;     // 칼로리정보 (예: "656.6 Kcal")
  NTR_INFO: string;     // 영양정보
  MLSV_FROM_YMD: string;
  MLSV_TO_YMD: string;
}

export interface NeisMealResponse {
  mealServiceDietInfo?: [
    { head: { list_total_count: number; RESULT: { CODE: string; MESSAGE: string } }[] },
    { row: NeisMealRow[] }
  ];
  RESULT?: {
    CODE: string;
    MESSAGE: string;
  };
}

export interface MealData {
  date: string;         // "2024-03-12"
  menu: string[];       // ["보리밥", "된장국", ...]
  kcal: string;         // "650.5 kcal"
  type: string;         // "중식"
}

export interface Post {
  id: string;
  author_id: string;
  author_name: string;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  content: string;
  created_at: string;
}
