import React, { useState, useEffect, useCallback } from 'react';
import { Login } from './components/Login';
import { CreatePost } from './components/CreatePost';
import { PostCard } from './components/PostCard';
import { User, Post } from './types';
import { api } from './services/api';
import { Avatar } from './components/Avatar';
import { LogOut, Search, User as UserIcon } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [viewUserId, setViewUserId] = useState<number>(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize viewUserId based on currentUser login
  useEffect(() => {
    if (currentUser) {
      setViewUserId(currentUser.id);
    }
  }, [currentUser]);

  const fetchPosts = useCallback(async () => {
    if (!currentUser) return;
    setLoadingPosts(true);
    setError(null);
    try {
      const data = await api.getPostsByUser(viewUserId);
      // Sort posts by ID desc (newest first) assuming ID is incremental or createdAt exists
      const sorted = data.sort((a, b) => b.id - a.id);
      setPosts(sorted);
    } catch (err) {
      console.error(err);
      setError("Could not load posts. Backend might be offline.");
    } finally {
      setLoadingPosts(false);
    }
  }, [currentUser, viewUserId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handlePostCreated = (newPost: Post) => {
    // If viewing the feed where the post belongs, append it
    if (viewUserId === currentUser?.id) {
      setPosts([newPost, ...posts]);
    } else {
      // If user posted while viewing someone else's feed, switch back to own feed or just notify
      setViewUserId(currentUser!.id); // Switch to own feed to see the new post
      // The useEffect will trigger and load the new list including the new post
    }
  };

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header / Sidebar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">IF</div>
            <span className="font-bold text-xl tracking-tight text-slate-900 hidden sm:block">IFConnected</span>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-transparent focus-within:border-indigo-300 focus-within:bg-white transition-all">
                <Search size={16} className="text-slate-400" />
                <span className="text-xs text-slate-500 mr-2 whitespace-nowrap">Feed ID:</span>
                <input 
                  type="number" 
                  min="1"
                  className="bg-transparent outline-none text-sm w-12 text-slate-700"
                  value={viewUserId}
                  onChange={(e) => setViewUserId(Number(e.target.value))}
                />
             </div>
             
             <div className="h-6 w-px bg-slate-200 mx-2"></div>

             <div className="flex items-center gap-3">
               <span className="text-sm font-medium text-slate-700 hidden sm:block">Hi, {currentUser.username}</span>
               <Avatar name={currentUser.username} />
               <button 
                onClick={() => setCurrentUser(null)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Logout"
               >
                 <LogOut size={20} />
               </button>
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Mobile View ID Toggle */}
        <div className="md:hidden mb-6 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                <UserIcon size={16} className="text-indigo-500" />
                <span className="text-sm text-slate-600">Viewing Feed:</span>
                <input 
                  type="number" 
                  min="1"
                  className="bg-slate-50 rounded px-2 py-1 outline-none text-sm w-16 text-center border border-slate-200 focus:border-indigo-500"
                  value={viewUserId}
                  onChange={(e) => setViewUserId(Number(e.target.value))}
                />
            </div>
        </div>

        {/* Create Post Area */}
        <CreatePost currentUser={currentUser} onPostCreated={handlePostCreated} />

        {/* Feed Status */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            {viewUserId === currentUser.id ? 'Your Feed' : `User ${viewUserId}'s Feed`}
          </h2>
          {loadingPosts && <span className="text-xs text-indigo-500 font-medium animate-pulse">Updating...</span>}
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {error ? (
            <div className="text-center py-10">
              <div className="text-red-500 mb-2">⚠️ {error}</div>
              <button 
                onClick={() => fetchPosts()}
                className="text-indigo-600 text-sm hover:underline"
              >
                Try Again
              </button>
            </div>
          ) : posts.length === 0 && !loadingPosts ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
              <p className="text-slate-400">No posts found for this user.</p>
              {viewUserId === currentUser.id && (
                <p className="text-indigo-500 text-sm mt-1">Be the first to say something!</p>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} currentUser={currentUser} />
            ))
          )}
        </div>
      </main>
    </div>
  );
}