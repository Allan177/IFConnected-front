import { request } from "./apiClient";
import { Post } from "@/types";

export const postService = {
  // GET /api/posts
  getAll: () => request<Post[]>("/posts"),

  // GET /api/posts/feed/{userId}
  getFriendsFeed: (userId: number) => request<Post[]>(`/posts/feed/${userId}`),

  // GET /api/posts/feed/regional?userId={id}&radiusKm={km}
  getRegionalFeed: (userId: number, radiusKm: number = 50) =>
    request<Post[]>(
      `/posts/feed/regional?userId=${userId}&radiusKm=${radiusKm}`
    ),

  // GET /api/posts/user/{userId}
  getPostsByUser: (userId: number) => request<Post[]>(`/posts/user/${userId}`),

  // POST /api/posts
  create: (formData: FormData) =>
    request<Post>("/posts", { method: "POST", body: formData }),
};
