// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  gender?: 'men' | 'women' | 'unisex' | 'all';
  role: 'user' | 'admin';
  status: 'active' | 'suspended' | 'deleted';
  onboardingCompleted: boolean;
  isPro: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  preferredStyles: string[];
  favouriteColours: string[];
  preferredOccasions: string[];
  preferredCategories: string[];
  gender?: 'men' | 'women' | 'unisex' | 'all';
  bodyType?: string;
  height?: string;
  preferredFit?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  displayName: string;
  ageConfirmed?: boolean;
  gender?: 'men' | 'women' | 'unisex' | 'all';
  onboardingCompleted?: boolean;
}

// ─── Wardrobe ────────────────────────────────────────────────────────────────

export interface WardrobeItem {
  id: string;
  userId: string;
  imageUrl: string;
  thumbnailUrl: string;
  name: string;
  category: string;
  subcategory?: string;
  color: string;
  secondaryColor?: string;
  pattern?: string;
  material?: string;
  brand?: string;
  price?: number;
  productUrl?: string;
  isCuratedSuggestion?: boolean;
  season?: string;
  style?: string;
  formality: string;
  tags: string[];
  isFavorite: boolean;
  isAvailable: boolean;
  timesWorn: number;
  lastWorn?: string;
  aiAnalysis?: ClothingAnalysis;
  createdAt: string;
  updatedAt: string;
}

export interface ClothingAnalysis {
  category: string;
  subcategory: string;
  color: string;
  pattern: string;
  material: string;
  formality: string;
  season: string[];
  style: string[];
  confidence: number;
}

export interface WardrobeFilters {
  category?: string;
  color?: string;
  season?: string;
  formality?: string;
  isFavorite?: boolean;
  isAvailable?: boolean;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'name' | 'most-worn' | 'least-worn';
}

// ─── Outfits ─────────────────────────────────────────────────────────────────

export interface Outfit {
  id: string;
  userId: string;
  occasion: string;
  style: string;
  weather?: string;
  colorPreference?: string;
  items: OutfitItem[];
  explanation: string;
  score: number;
  feedback?: OutfitFeedback;
  createdAt: string;
}

export interface OutfitItem {
  id: string;
  outfitId: string;
  wardrobeItemId: string;
  wardrobeItem: WardrobeItem;
  slot: string;
  imageUrl?: string;
  name?: string;
  notes?: string;
}

export interface OutfitFeedback {
  id: string;
  outfitId: string;
  userId: string;
  rating: 'loved' | 'liked' | 'neutral' | 'disliked' | 'rejected';
  comment?: string;
  createdAt: string;
}

export interface SavedOutfit {
  id: string;
  userId: string;
  outfitId: string;
  outfit: Outfit;
  collectionId?: string;
  notes?: string;
  savedAt: string;
  wornCount?: number;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  coverImageUrl?: string;
  outfitCount: number;
  savedOutfits?: SavedOutfit[];
  createdAt: string;
  updatedAt: string;
}

export interface OutfitHistory {
  id: string;
  userId: string;
  outfitId: string;
  outfit: Outfit;
  wornAt: string;
  occasion?: string;
  weather?: string;
  notes?: string;
  rating?: number;
  photoUrl?: string;
}

export interface GenerateOutfitRequest {
  occasion: string;
  style: string;
  weather?: string;
  season?: string;
  gender?: 'men' | 'women' | 'unisex' | 'all';
  outerwearOption?: 'auto' | 'yes' | 'no';
  colorPreference?: string;
  excludeItems?: string[];
  excludeOutfitIds?: string[];
  differentFromOutfitId?: string;
  formality?: string;
  wardrobeOnly?: boolean;
}

// ─── Community ───────────────────────────────────────────────────────────────

export interface CommunityPost {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'displayName' | 'avatarUrl'>;
  title: string;
  content: string;
  imageUrl?: string;
  outfitId?: string;
  outfit?: Outfit;
  tags: string[];
  upvotes: number;
  downvotes: number;
  commentCount: number;
  userVote?: 'up' | 'down' | null;
  isReported: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: Pick<User, 'id' | 'displayName' | 'avatarUrl'>;
  parentId?: string;
  content: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Vote {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'post' | 'comment';
  value: 'up' | 'down';
  createdAt: string;
}

// ─── Explore ─────────────────────────────────────────────────────────────────

export interface StyleInspiration {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  style: string;
  category?: string;
  occasion: string;
  season?: string;
  tags: string[];
  likes: number;
  saves: number;
  isLiked: boolean;
  isSaved: boolean;
  source?: string;
  sourceUrl?: string;
  isPinterest?: boolean;
  boardName?: string;
  colors?: string[];
  createdAt: string;
}

export interface PinterestConnection {
  connected: boolean;
  username?: string;
  profileUrl?: string;
  avatarUrl?: string;
  boardsCount?: number;
  pinsCount?: number;
  aestheticTags?: string[];
  colorPalette?: string[];
  lastSyncedAt?: string;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: 'outfit_ready' | 'community_reply' | 'community_vote' | 'system' | 'reminder' | 'achievement';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

// ─── Privacy ─────────────────────────────────────────────────────────────────

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: 'analytics' | 'marketing' | 'personalization' | 'cookies';
  granted: boolean;
  grantedAt: string;
  withdrawnAt?: string;
  ipAddress?: string;
}

export interface DataExport {
  user: User;
  preferences: UserPreferences;
  wardrobeItems: WardrobeItem[];
  outfits: Outfit[];
  savedOutfits: SavedOutfit[];
  collections: Collection[];
  history: OutfitHistory[];
  communityPosts: CommunityPost[];
  consents: ConsentRecord[];
  exportedAt: string;
}

export interface DeletionRequest {
  id: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  requestedAt: string;
  scheduledAt: string;
  completedAt?: string;
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface AdminStats {
  userCount: number;
  itemCount: number;
  outfitCount: number;
  postCount: number;
  reportCount: number;
  activeUsers: number;
}

export interface Report {
  id: string;
  reporterId: string;
  reporter: Pick<User, 'id' | 'displayName'>;
  targetId: string;
  targetType: 'post' | 'comment';
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── API ─────────────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  errors?: { field: string; message: string }[];
  statusCode: number;
}

// ─── Style Bucket List / Wishlist ────────────────────────────────────────────

export interface BucketListItem {
  id: string;
  userId: string;
  title: string;
  category: string;
  brand: string;
  targetPrice: number;
  currency: string;
  imageUrl: string;
  productUrl?: string;
  priority: 'grail' | 'high' | 'saving' | 'casual';
  notes?: string;
  status: 'dreaming' | 'acquired';
  acquiredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BucketListStats {
  totalItems: number;
  totalDesiredValue: number;
  acquiredCount: number;
  dreamingCount: number;
}
