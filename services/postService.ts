import { httpClient } from "./apiClient";
import { Post } from "@/types";

export const postService = {
  // GET /api/posts
  getAll: () => httpClient<Post[]>("/posts"),

  // GET /api/posts/feed/{userId}
  getFriendsFeed: (userId: number) =>
    httpClient<Post[]>(`/posts/feed/${userId}`),

  // GET /api/posts/feed/regional?userId={id}&radiusKm={km}
  getRegionalFeed: (userId: number, radiusKm: number = 50) =>
    httpClient<Post[]>(
      `/posts/feed/regional?userId=${userId}&radiusKm=${radiusKm}`
    ),

  // GET /api/posts/user/{userId}
  getPostsByUser: (userId: number) =>
    httpClient<Post[]>(`/posts/user/${userId}`),

  // POST /api/posts
  create: (formData: FormData) =>
    httpClient<Post>("/posts", { method: "POST", body: formData }),
};
