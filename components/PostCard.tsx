import React, { useState } from 'react';
import { Post, User, Comment } from '../types';
import { api } from '../services/api';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { MessageCircle, Heart, Share2, Send } from 'lucide-react';

interface PostCardProps {
  post: Post;
  currentUser: User;
}

export const PostCard: React.FC<PostCardProps> = ({ post, currentUser }) => {
  const [comments, setComments] = useState<Comment[]>(post.comments || []);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const addedComment = await api.addComment(post.id, {
        userId: currentUser.id,
        text: newComment
      });
      // Backend might return the comment but lacks the full user info sometimes.
      // We'll optimistically add it or assume backend returns sufficient data
      const commentWithUser = { ...addedComment, username: currentUser.username };
      setComments([...comments, commentWithUser]);
      setNewComment('');
    } catch (error) {
      console.error("Failed to add comment", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 mb-4 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar name={`User ${post.userId}`} />
            <div>
              <h3 className="font-semibold text-slate-900">User {post.userId}</h3>
              <p className="text-xs text-slate-500">
                {/* Mock date if backend doesn't send it, else format it */}
                {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Just now'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <p className="text-slate-800 mb-4 whitespace-pre-wrap leading-relaxed">{post.content}</p>

        {/* Image Attachment */}
        {post.imageUrl && (
          <div className="mb-4 -mx-4 md:mx-0">
            <img 
              src={post.imageUrl} 
              alt="Post attachment" 
              className="w-full h-auto md:rounded-xl object-cover max-h-[500px] bg-slate-50"
              loading="lazy"
            />
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center gap-6 text-slate-500 pt-2 border-t border-slate-50">
          <button 
            className="flex items-center gap-2 hover:text-indigo-600 transition-colors"
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
          >
            <MessageCircle size={20} />
            <span className="text-sm font-medium">{comments.length}</span>
          </button>
          <button className="flex items-center gap-2 hover:text-rose-500 transition-colors group">
            <Heart size={20} className="group-hover:fill-rose-500" />
            <span className="text-sm font-medium">Like</span>
          </button>
          <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {isCommentsOpen && (
        <div className="bg-slate-50 p-4 border-t border-slate-100">
          {/* List */}
          <div className="space-y-4 mb-4">
            {comments.length === 0 && (
              <p className="text-slate-400 text-sm text-center italic">No comments yet. Be the first!</p>
            )}
            {comments.map((comment, idx) => (
              <div key={comment.id || idx} className="flex gap-3">
                <Avatar name={comment.username || `User ${comment.userId}`} size="sm" />
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm flex-1">
                  <p className="text-xs font-bold text-slate-700 mb-1">
                    {comment.username || `User ${comment.userId}`}
                  </p>
                  <p className="text-sm text-slate-800">{comment.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
             <Avatar name={currentUser.username} size="sm" />
             <div className="flex-1 relative">
               <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full pl-4 pr-12 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
               />
               <button 
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 disabled:text-slate-300 p-1 hover:bg-indigo-50 rounded-full transition-colors"
               >
                 <Send size={16} />
               </button>
             </div>
          </form>
        </div>
      )}
    </div>
  );
};