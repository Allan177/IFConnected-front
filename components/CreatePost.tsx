import React, { useState, useRef } from "react";
import { User, Post } from "../types";
import { api } from "../services/api";
import { Image as ImageIcon, Send, X, Loader2 } from "lucide-react";

interface CreatePostProps {
  currentUser: User;
  onPostCreated: (post: Post) => void;
}

export const CreatePost: React.FC<CreatePostProps> = ({
  currentUser,
  onPostCreated,
}) => {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !selectedFile) return;

    setLoading(true);
    try {
      const newPost = await api.createPost(
        currentUser.id,
        content,
        selectedFile
      );
      onPostCreated(newPost); // Avisa o pai que criou

      // Limpa tudo
      setContent("");
      clearFile();
    } catch (error) {
      alert("Erro ao criar post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          {/* Avatar Pequeno */}
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0">
            {currentUser.username.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1">
            <textarea
              className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400 resize-none h-12 py-2"
              placeholder="O que está acontecendo?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            {/* Preview da Imagem */}
            {previewUrl && (
              <div className="relative mt-2 mb-4 w-fit">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-60 rounded-lg border border-slate-200"
                />
                <button
                  type="button"
                  onClick={clearFile}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50">
              {/* Botão de Imagem */}
              <div
                className="text-indigo-500 cursor-pointer p-2 hover:bg-indigo-50 rounded-full transition-colors"
                onClick={() => fileInputRef.current?.click()}
                title="Adicionar foto"
              >
                <ImageIcon size={20} />
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </div>

              {/* Botão de Enviar */}
              <button
                type="submit"
                disabled={loading || (!content && !selectedFile)}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Postando...
                  </>
                ) : (
                  <>
                    Publicar <Send size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
