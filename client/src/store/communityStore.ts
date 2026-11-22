import { create } from 'zustand';
import api from '@/services/api';
import type { CommunityPost, Comment } from '@/types';

interface CommunityState {
  posts: CommunityPost[];
  currentPost: CommunityPost | null;
  comments: Comment[];
  isLoading: boolean;
  filterSort: 'latest' | 'top' | 'hot';
  fetchPosts: (sort?: 'latest' | 'top' | 'hot', search?: string) => Promise<void>;
  fetchPostById: (id: string) => Promise<void>;
  createPost: (data: { title: string; content?: string; postType?: string; imageUrl?: string }) => Promise<CommunityPost>;
  votePost: (id: string, value: 'up' | 'down' | 'none') => Promise<void>;
  addComment: (postId: string, content: string, parentId?: string) => Promise<Comment>;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  posts: [],
  currentPost: null,
  comments: [],
  isLoading: false,
  filterSort: 'latest',

  fetchPosts: async (sort = 'latest', search) => {
    set({ isLoading: true, filterSort: sort });
    try {
      const params: any = { sort };
      if (search) params.search = search;
      const res: any = await api.get('/community/posts', { params });
      set({ posts: res.data || [], isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  fetchPostById: async (id: string) => {
    set({ isLoading: true });
    try {
      const res: any = await api.get(`/community/posts/${id}`);
      set({ currentPost: res.post, comments: res.comments || [], isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  createPost: async (data) => {
    const post: any = await api.post('/community/posts', data);
    set((state) => ({ posts: [post, ...state.posts] }));
    return post;
  },

  votePost: async (id: string, value) => {
    const res: any = await api.post(`/community/posts/${id}/vote`, { value });
    set((state) => ({
      posts: state.posts.map((p) => (p.id === id ? { ...p, upvotes: res.upvotes, downvotes: res.downvotes, userVote: res.userVote } : p)),
      currentPost: state.currentPost?.id === id ? { ...state.currentPost, upvotes: res.upvotes, downvotes: res.downvotes, userVote: res.userVote } : state.currentPost,
    }));
  },

  addComment: async (postId, content, parentId) => {
    const comment: any = await api.post(`/community/posts/${postId}/comments`, { content, parentId });
    set((state) => ({ comments: [...state.comments, comment] }));
    return comment;
  },
}));
