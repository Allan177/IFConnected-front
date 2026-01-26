"use client";
import React, { useEffect, useRef, useState } from "react";
import { Post, User } from "@/types";
import { postService } from "@/services/postService";
import { Image as ImageIcon, X, Loader2 } from "lucide-react";
import Image from "next/image";

interface CreatePostProps {
  user: User;
  onPostCreated: (post: Post) => void;
}

export default function CreatePost({ user, onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ mantém o user do composer sempre atualizado (foto/username)
  const [currentUser, setCurrentUser] = useState<User>(user);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncFromStorage = () => {
      const stored = localStorage.getItem("ifconnected:user");
      if (!stored) return;
      try {
        const parsed: User = JSON.parse(stored);
        // só atualiza se for o mesmo usuário logado
        if (parsed?.id === user.id) setCurrentUser(parsed);
      } catch {}
    };

    syncFromStorage();

    const handler = () => syncFromStorage();
    window.addEventListener("ifconnected:user-updated", handler);
    return () => window.removeEventListener("ifconnected:user-updated", handler);
  }, [user.id]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreviewUrl(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("userId", currentUser.id.toString());
    formData.append("content", content);
    if (imageFile) formData.append("file", imageFile);

    try {
      const newPost = await postService.create(formData);

      setContent("");
      setImageFile(null);
      setImagePreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      onPostCreated(newPost);
    } catch (error) {
      console.error("Erro ao criar post:", error);
      alert("Falha ao publicar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const avatarLetter =
    currentUser?.username?.trim()?.[0]?.toUpperCase() ||
    currentUser?.email?.trim()?.[0]?.toUpperCase() ||
    "U";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-slate-800 p-4"
    >
      <div className="flex gap-3">
        {/* ✅ Avatar real */}
        <div className="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-500 flex items-center justify-center font-bold text-sky-600 dark:text-white shrink-0 overflow-hidden relative">
          {currentUser?.profileImageUrl ? (
            <Image
              src={currentUser.profileImageUrl}
              alt="Avatar"
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            avatarLetter
          )}
        </div>

        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`O que está acontecendo no Campus, ${currentUser.username}?`}
            className="w-full resize-none outline-none text-xl placeholder:text-slate-400 dark:placeholder:text-slate-600 bg-transparent text-slate-900 dark:text-slate-50"
            rows={content || imageFile ? 3 : 1}
          />

          {imagePreviewUrl && (
            <div className="relative mt-3 mb-3">
              <img
                src={imagePreviewUrl}
                alt="Preview"
                className="max-h-64 object-cover rounded-xl w-full border border-slate-200 dark:border-slate-700"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreviewUrl(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sky-500 hover:text-sky-600 transition-colors"
            >
              <ImageIcon size={20} />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </button>

            <button
              type="submit"
              disabled={loading || (!content.trim() && !imageFile)}
              className="bg-sky-600 text-white px-5 py-2 rounded-full font-bold text-sm shadow-md hover:bg-sky-500 cursor-pointer transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Publicar"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
