export interface BlogAuthor {
  id: string;
  name: string;
  type: "member" | "mentor";
}

export interface BlogItem {
  id: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  tags: string[];
  author: BlogAuthor;
  publishedAt: string;
  viewCount?: number;
}

export interface BlogDetail extends BlogItem {
  content?: string;
}

export const BLOG_SORT_OPTIONS = ["Newest", "Oldest", "Popular"] as const;
export type BlogSortOption = (typeof BLOG_SORT_OPTIONS)[number];
