import { ClassSchedule, Task } from '../types';

export const mockSchedules: ClassSchedule[] = [
  { id: '1', name: '자료구조', professor: '김아무개', room: '공학관 301호', day: '월', startTime: '09:00', endTime: '10:30', color: 'blue' },
  { id: '2', name: '운영체제', professor: '이교수', room: '정보관 204호', day: '월', startTime: '11:00', endTime: '12:30', color: 'purple' },
  { id: '3', name: '알고리즘', professor: '박박사', room: 'IT융합 101호', day: '화', startTime: '13:00', endTime: '15:00', color: 'emerald' },
  { id: '4', name: '데이터베이스', professor: '최데이터', room: '공학관 405호', day: '수', startTime: '10:00', endTime: '11:30', color: 'orange' },
  { id: '5', name: '자료구조', professor: '김아무개', room: '공학관 301호', day: '수', startTime: '14:00', endTime: '15:30', color: 'blue' },
  { id: '6', name: '웹프로그래밍', professor: '정프론트', room: '비전관 202호', day: '목', startTime: '15:00', endTime: '17:00', color: 'indigo' },
  { id: '7', name: '소프트웨어공학', professor: '강소프트', room: '정보관 501호', day: '금', startTime: '10:00', endTime: '12:00', color: 'rose' },
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);

export const mockTasks: Task[] = [
  { id: 't1', title: '영어 숙제', courseName: '영어', dueDate: today.toISOString(), status: 'TODO', priority: 'High' },
  { id: 't2', title: '구몬 학습지 숙제', courseName: '구몬', dueDate: tomorrow.toISOString(), status: 'IN_PROGRESS', priority: 'Medium' },
  { id: 't3', title: '피아노 연습', courseName: '피아노', dueDate: nextWeek.toISOString(), status: 'TODO', priority: 'Low' },

];
