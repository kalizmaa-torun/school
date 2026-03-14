"use client";

import { Users, MessageSquare, Heart, Share2 } from "lucide-react";

export default function CommunityPage() {
  const posts = [
    {
      id: 1,
      author: "김철수 학부모",
      content: "오늘 우리 학교 운동회가 너무 즐거웠어요! 아이들이 신나게 뛰어노는 모습을 보니 기쁘네요.",
      likes: 12,
      comments: 5,
      time: "2시간 전"
    },
    {
      id: 2,
      author: "이영희 학부모",
      content: "급식 메뉴가 정말 잘 나오네요. 아이가 매일 학교 가는 걸 즐거워해서 다행입니다.",
      likes: 8,
      comments: 3,
      time: "4시간 전"
    },
    {
      id: 3,
      author: "박민준 학부모",
      content: "이번 주말에 학교 근처에서 학부모 모임을 가질 예정인데, 관심 있으신 분 계신가요?",
      likes: 15,
      comments: 10,
      time: "6시간 전"
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20">
            <Users className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">커뮤니티</h1>
            <p className="text-slate-500 text-sm">학부모님들과 소통하고 정보를 나누세요</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-md">
          글쓰기
        </button>
      </div>

      <div className="grid gap-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
                  {post.author.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-[var(--foreground)]">{post.author}</h3>
                  <p className="text-xs text-slate-400">{post.time}</p>
                </div>
              </div>
            </div>
            <p className="text-[var(--foreground)] leading-relaxed mb-6">
              {post.content}
            </p>
            <div className="flex items-center gap-6 pt-4 border-t border-[var(--border)]">
              <button className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors text-sm">
                <Heart size={18} />
                <span>{post.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors text-sm">
                <MessageSquare size={18} />
                <span>{post.comments}</span>
              </button>
              <button className="flex items-center gap-2 text-slate-500 hover:text-blue-500 transition-colors text-sm ml-auto">
                <Share2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
