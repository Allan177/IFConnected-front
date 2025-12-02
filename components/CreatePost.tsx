import React, { useState, useRef } from 'react';
import { User, Post } from '../types';
import { api } from '../services/api';
import { Button } from './Button';
import { Image as ImageIcon, X, Send } from 'lucide-react';
import { Avatar } from './Avatar';

interface CreatePostProps {
  currentUser: User;
  onPostCreated: (post: Post) => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({ currentUser, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;

    setIsSubmitting(true);
    try {
      const newPost = await api.createPost(currentUser.id, content, selectedFile);
      onPostCreated(newPost);
      // Reset form
      setContent('');
      removeImage();
    } catch (error) {
      console.error("Failed to post", error);
      alert("Failed to create post. Check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-6">
      <div className="flex gap-4">
        <Avatar name={currentUser.username} size="md" />
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening?"
            className="w-full resize-none border-none focus:ring-0 text-slate-700 placeholder-slate-400 text-lg min-h-[60px]"
            rows={2}
          />
          
          {previewUrl && (
            <div className="relative mt-2 mb-4">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="rounded-xl max-h-64 object-cover border border-slate-100"
              />
              <button 
                onClick={removeImage}
                className="absolute top-2 left-2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-2">
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-full transition-colors"
              >
                <ImageIcon size={20} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </div>
            
            <Button 
              onClick={handleSubmit} 
              isLoading={isSubmitting}
              disabled={!content.trim() && !selectedFile}
              className="rounded-full px-6"
            >
              <span className="mr-2">Post</span> <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};