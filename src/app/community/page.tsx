"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, MessageSquare, Heart, Share2, Loader2, PenSquare, Send, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Post, Comment } from "@/types";
import { useAuthStore } from "@/store/authStore";

export default function CommunityPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [myLikes, setMyLikes] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentsData, setCommentsData] = useState<Record<string, Comment[]>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [isCommenting, setIsCommenting] = useState<Record<string, boolean>>({});

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("community")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);

      // 사용자가 좋아요 누른 목록 가져오기
      if (user) {
        const { data: likesData } = await supabase
          .from("post_likes")
          .select("post_id")
          .eq("user_id", user.id);
        
        if (likesData) {
          setMyLikes(new Set(likesData.map(l => l.post_id)));
        }
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const handleLike = async (postId: string) => {
    if (!user) {
      alert("로그인이 필요한 기능입니다.");
      return;
    }

    const isLiked = myLikes.has(postId);
    const newLikes = new Set(myLikes);

    try {
      if (isLiked) {
        // 좋아요 취소
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", postId);
        
        if (error) throw error;

        // DB 카운트 수동 업데이트 (트리거 미설정 대비)
        const post = posts.find(p => p.id === postId);
        await supabase
          .from("community")
          .update({ likes_count: Math.max(0, (post?.likes_count || 1) - 1) })
          .eq("id", postId);

        newLikes.delete(postId);
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, likes_count: Math.max(0, (p.likes_count || 1) - 1) } : p
        ));
      } else {
        // 좋아요 추가
        const { error } = await supabase
          .from("post_likes")
          .insert({ user_id: user.id, post_id: postId });
        
        if (error) throw error;

        // DB 카운트 수동 업데이트
        const post = posts.find(p => p.id === postId);
        await supabase
          .from("community")
          .update({ likes_count: (post?.likes_count || 0) + 1 })
          .eq("id", postId);

        newLikes.add(postId);
        setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p
        ));
      }
      setMyLikes(newLikes);
    } catch (error) {
      console.error("Like toggle failed:", error);
    }
  };

  const toggleComments = async (postId: string) => {
    const isExpanded = expandedComments.has(postId);
    const newExpanded = new Set(expandedComments);

    if (isExpanded) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
      // 댓글 데이터가 없는 경우만 가져옴
      if (!commentsData[postId]) {
        fetchComments(postId);
      }
    }
    setExpandedComments(newExpanded);
  };

  const fetchComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from("community_comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      setCommentsData(prev => ({ ...prev, [postId]: data || [] }));
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    }
  };

  const handleAddComment = async (postId: string) => {
    const commentText = newComment[postId]?.trim();
    const { children, selectedChildIndex } = useAuthStore.getState();

    if (!user || !commentText) return;

    setIsCommenting(prev => ({ ...prev, [postId]: true }));
    try {
      const activeChild = children[selectedChildIndex];
      const author_name = activeChild 
        ? `${activeChild.baby_school} ${activeChild.baby_name} 학부모님`
        : (user.user_metadata?.username || user.email?.split("@")[0] || "익명");

      const { data, error } = await supabase
        .from("community_comments")
        .insert({
          post_id: postId,
          author_id: user.id,
          author_name: author_name,
          content: commentText
        })
        .select()
        .single();
      
      if (error) throw error;

      // DB 카운트 수동 업데이트 (트리거 미설정 대비)
      const post = posts.find(p => p.id === postId);
      await supabase
        .from("community")
        .update({ comments_count: (post?.comments_count || 0) + 1 })
        .eq("id", postId);

      // 로컬 게시글 댓글 수 업데이트
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p
      ));

      // 로컬 댓글 목록 업데이트
      setCommentsData(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), data]
      }));
      setNewComment(prev => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Comment post failed:", error);
      alert("댓글 작성에 실패했습니다.");
    } finally {
      setIsCommenting(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      const { error } = await supabase
        .from("community_comments")
        .delete()
        .eq("id", commentId);
      
      if (error) throw error;

      // DB 카운트 수동 업데이트
      const post = posts.find(p => p.id === postId);
      await supabase
        .from("community")
        .update({ comments_count: Math.max(0, (post?.comments_count || 1) - 1) })
        .eq("id", postId);

      // 로컬 게시글 댓글 수 업데이트
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, comments_count: Math.max(0, (p.comments_count || 1) - 1) } : p
      ));

      // 로컬 댓글 목록 업데이트
      setCommentsData(prev => ({
        ...prev,
        [postId]: prev[postId].filter(c => c.id !== commentId)
      }));
    } catch (error) {
      console.error("Comment delete failed:", error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    return `${days}일 전`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--primary)] rounded-xl shadow-lg shadow-[var(--primary)]/20">
            <Users className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">커뮤니티</h1>
            <p className="text-stone-500 dark:text-stone-400 mt-1 text-sm">학부모님들과 소통하고 정보를 나누세요</p>
          </div>
        </div>
        <Link 
          href="/community/write"
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl transition-all font-bold shadow-lg shadow-[var(--primary)]/20 active:scale-95"
        >
          <PenSquare size={18} />
          <span>글쓰기</span>
        </Link>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
            <p className="text-stone-500 font-medium">게시글을 불러오는 중...</p>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="bg-white border border-stone-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600 border border-orange-200">
                    {post.author_name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-stone-800">{post.author_name}</h3>
                    <p className="text-xs text-stone-400">{formatDate(post.created_at)}</p>
                  </div>
                </div>
              </div>
              <p className="text-stone-700 leading-relaxed mb-6 whitespace-pre-wrap">
                {post.content}
              </p>
              
              <div className="flex items-center gap-6 pt-4 border-t border-stone-100">
                <button 
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 transition-colors text-sm font-medium ${
                    myLikes.has(post.id) ? "text-orange-600" : "text-stone-500 hover:text-orange-500"
                  }`}
                >
                  <Heart size={18} fill={myLikes.has(post.id) ? "currentColor" : "none"} />
                  <span>{post.likes_count || 0}</span>
                </button>
                <button 
                  onClick={() => toggleComments(post.id)}
                  className={`flex items-center gap-2 transition-colors text-sm font-medium ${
                    expandedComments.has(post.id) ? "text-[var(--primary)]" : "text-stone-500 hover:text-[var(--primary)]"
                  }`}
                >
                  <MessageSquare size={18} />
                  <span>{post.comments_count || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-stone-500 hover:text-orange-500 transition-colors text-sm font-medium ml-auto">
                  <Share2 size={18} />
                </button>
              </div>

              {/* 댓글 섹션 */}
              {expandedComments.has(post.id) && (
                <div className="mt-6 pt-6 border-t border-stone-50 space-y-4">
                  {/* 댓글 목록 */}
                  <div className="space-y-4">
                    {commentsData[post.id]?.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-stone-500 text-xs border border-stone-200">
                          {comment.author_name?.charAt(0) || "?"}
                        </div>
                        <div className="flex-1 bg-stone-50 rounded-2xl px-4 py-2">
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-stone-800">{comment.author_name}</span>
                              <span className="text-[10px] text-stone-400">{formatDate(comment.created_at)}</span>
                            </div>
                            {user?.id === comment.author_id && (
                              <button 
                                onClick={() => handleDeleteComment(post.id, comment.id)}
                                className="text-stone-300 hover:text-red-500 transition-colors p-1"
                                title="댓글 삭제"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-stone-600 leading-snug">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                    {commentsData[post.id]?.length === 0 && (
                      <p className="text-center text-stone-400 text-xs py-4">첫 번째 댓글을 남겨보세요!</p>
                    )}
                  </div>

                  {/* 댓글 입력창 */}
                  {user && (
                    <div className="flex gap-3 pt-2">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600 text-xs border border-orange-200">
                        {user.user_metadata?.username?.charAt(0) || user.email?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newComment[post.id] || ""}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyPress={(e) => e.key === "Enter" && handleAddComment(post.id)}
                          placeholder="댓글을 입력하세요..."
                          className="w-full bg-stone-100 border-none rounded-2xl px-4 py-2 text-sm text-stone-700 focus:ring-2 focus:ring-[var(--primary)] transition-all outline-none pr-10"
                        />
                        <button 
                          onClick={() => handleAddComment(post.id)}
                          disabled={!newComment[post.id]?.trim() || isCommenting[post.id]}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[var(--primary)] hover:bg-white rounded-full transition-all disabled:opacity-30"
                        >
                          {isCommenting[post.id] ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <Send size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
            <MessageSquare className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-500">아직 등록된 게시글이 없습니다.</p>
            <p className="text-stone-400 text-sm mt-1">첫 번째 게시글을 남겨보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
}
