"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuthStore } from "@/store/authStore";
import { ArrowLeft, Send, Loader2 } from "lucide-react";

export default function WritePostPage() {
  const router = useRouter();
  const { user, children, selectedChildIndex } = useAuthStore();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const activeChild = children[selectedChildIndex];
      const author_name = activeChild 
        ? `${activeChild.baby_school} ${activeChild.baby_name} 학부모님`
        : (user.user_metadata?.username || user.email?.split("@")[0] || "익명 학부모");

      const { error } = await supabase.from("community").insert([
        {
          author_id: user.id,
          author_name: author_name,
          content: content.trim(),
        },
      ]);

      if (error) throw error;

      router.push("/community");
      router.refresh();
    } catch (error) {
      console.error("Failed to save post:", error);
      alert("글 저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-stone-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-stone-600" />
        </button>
        <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">새 글 작성</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-sm focus-within:ring-2 focus-within:ring-[var(--primary)] transition-all">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="학부모님들과 나누고 싶은 이야기를 적어보세요..."
            className="w-full h-64 resize-none outline-none text-stone-700 bg-transparent"
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:bg-stone-300 text-white rounded-xl transition-all font-bold shadow-lg shadow-[var(--primary)]/20 active:scale-95"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Send size={20} />
            )}
            <span>올리기</span>
          </button>
        </div>
      </form>
    </div>
  );
}
