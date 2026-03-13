import { ClassSchedule, DayOfWeek, NeisTimetableResponse, MealData, NeisMealResponse } from '../types';

const API_KEY = 'aa419952afc94da7a3e38444312f2121';
const BASE_URL = 'https://open.neis.go.kr/hub/elsTimetable';

// 초등학교 주간 교시별 기준 마스터 (임시 매핑)
const periodTimeMap: Record<string, { start: string; end: string }> = {
  '1': { start: '09:00', end: '09:40' },
  '2': { start: '09:50', end: '10:30' },
  '3': { start: '10:40', end: '11:20' },
  '4': { start: '11:30', end: '12:10' },
  '5': { start: '13:00', end: '13:40' },
  '6': { start: '13:50', end: '14:30' },
};

const colors = ['blue', 'purple', 'emerald', 'orange', 'indigo', 'rose'];

export async function getWeeklyTimetable(
  startDate: Date, 
  endDate: Date, 
  officeCode: string,
  schoolCode: string,
  grade: string, 
  classNm: string
): Promise<ClassSchedule[]> {
  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);
  
  const url = `${BASE_URL}?KEY=${API_KEY}&Type=json&pSize=100&ATPT_OFCDC_SC_CODE=${officeCode}&SD_SCHUL_CODE=${schoolCode}&GRADE=${grade}&CLASS_NM=${classNm}&TI_FROM_YMD=${startStr}&TI_TO_YMD=${endStr}`;
  
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data: NeisTimetableResponse = await res.json();
    
    if (data.RESULT?.CODE === 'INFO-200' || !data.elsTimetable) {
      return []; // 해당하는 데이터가 없을 경우 빈 배열 반환
    }
    
    const rows = data.elsTimetable[1].row;
    let colorIdx = 0;
    const subjectColorMap = new Map<string, string>();
    
    return rows.map((row, idx) => {
      // 과목별로 고정된 색상 지정
      if (!subjectColorMap.has(row.ITRT_CNTNT)) {
        subjectColorMap.set(row.ITRT_CNTNT, colors[colorIdx % colors.length]);
        colorIdx++;
      }
      
      const times = periodTimeMap[row.PERIO] || { start: '15:00', end: '15:40' }; // 기본값
      
      // YYYYMMDD -> Date (요일 추출용)
      const yStr = row.ALL_TI_YMD.substring(0, 4);
      const mStr = row.ALL_TI_YMD.substring(4, 6);
      const dStr = row.ALL_TI_YMD.substring(6, 8);
      const date = new Date(`${yStr}-${mStr}-${dStr}`);
      const days = ['일', '월', '화', '수', '목', '금', '토'];
      
      return {
        id: `neis-${row.ALL_TI_YMD}-${row.PERIO}-${idx}`,
        name: row.ITRT_CNTNT,
        professor: `${row.PERIO}교시`,
        room: `${row.GRADE}학년 ${row.CLASS_NM}반`,
        day: days[date.getDay()] as DayOfWeek,
        startTime: times.start,
        endTime: times.end,
        color: subjectColorMap.get(row.ITRT_CNTNT) || 'blue'
      };
    });
  } catch (error) {
    console.error('Failed to fetch NEIS timetable:', error);
    return [];
  }
}

function formatDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

// 급식 정보 가져오기 (월간)
export async function getMonthlyMealInfo(
  officeCode: string,
  schoolCode: string,
  yearMonth: string // YYYYMM 형식
): Promise<MealData[]> {
  const MEAL_URL = 'https://open.neis.go.kr/hub/mealServiceDietInfo';
  const url = `${MEAL_URL}?KEY=${API_KEY}&Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${officeCode}&SD_SCHUL_CODE=${schoolCode}&MLSV_YMD=${yearMonth}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data: NeisMealResponse = await res.json();

    if (data.RESULT?.CODE === 'INFO-200' || !data.mealServiceDietInfo) {
      return [];
    }

    const rows = data.mealServiceDietInfo[1].row;

    return rows.map(row => {
      // DDISH_NM 예: "보리밥<br/>된장국(5.6.)<br/>제육볶음(5.6.10.13.)"
      // HTML 태그 제거 및 괄호(알레르기 정보) 제거 등 정제 작업
      const menu = row.DDISH_NM
        .split('<br/>')
        .map(item => item.replace(/\([^)]*\)/g, '').replace(/@/g, '').trim())
        .filter(item => item !== "");

      // 날짜 포맷팅: YYYYMMDD -> YYYY-MM-DD
      const dateStr = `${row.MLSV_YMD.substring(0, 4)}-${row.MLSV_YMD.substring(4, 6)}-${row.MLSV_YMD.substring(6, 8)}`;

      // 칼로리 정보 (CAL_INFO 필드 사용)
      const kcal = row.CAL_INFO || '기록 없음';

      return {
        date: dateStr,
        menu,
        kcal,
        type: row.MMEAL_SC_NM
      };
    });
  } catch (error) {
    console.error('Failed to fetch NEIS meal info:', error);
    return [];
  }
}

export async function searchSchool(officeCode: string, schoolName: string) {
  const SCHOOL_INFO_URL = 'https://open.neis.go.kr/hub/schoolInfo';
  // SCHUL_KND_SC_NM=초등학교 필터를 추가하여 초등학교만 검색하도록 제한
  const url = `${SCHOOL_INFO_URL}?KEY=${API_KEY}&Type=json&pSize=100&ATPT_OFCDC_SC_CODE=${officeCode}&SCHUL_NM=${encodeURIComponent(schoolName)}&SCHUL_KND_SC_NM=${encodeURIComponent('초등학교')}`;
  
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const data = await res.json();
    
    if (data.RESULT?.CODE === 'INFO-200' || !data.schoolInfo) {
      return []; 
    }
    
    return data.schoolInfo[1].row;
  } catch (error) {
    console.error('Failed to search NEIS school info:', error);
    return [];
  }
}
