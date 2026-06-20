import { CMS_CACHE_TAGS, OFFERINGS_CACHE_TAGS } from "@/lib/cms-cache-tags";

function getApiUrl(): string {
  // Browser must use localhost — "backend" only resolves inside Docker network
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
  }
  // Server-side rendering inside Docker can use internal hostname
  return (
    process.env.INTERNAL_API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8000/api/v1"
  );
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type ApiOptions = RequestInit & {
  token?: string | null;
  cache?: RequestCache;
  next?: { revalidate?: number | false; tags?: string[] };
};

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { token, cache, next: nextCache, ...init } = options;
  const url = `${getApiUrl()}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(init.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...init,
    headers,
    cache: cache ?? (token ? "no-store" : undefined),
    next: token ? undefined : (nextCache ?? { revalidate: 60 }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    const message = formatApiErrorMessage(error);
    throw new ApiError(response.status, message);
  }

  return response.json();
}

function formatApiErrorMessage(error: {
  message?: string;
  errors?: Record<string, string[]>;
}): string {
  if (error.errors) {
    const fieldMessages = Object.entries(error.errors).flatMap(([field, messages]) =>
      messages.map((msg) => (field === "email" || field === "phone" ? msg : `${field}: ${msg}`)),
    );
    if (fieldMessages.length > 0) {
      return fieldMessages.join(" ");
    }
  }

  return error.message ?? "Request failed";
}

export const apiClient = {
  getHomepage: () =>
    api<{ data: HomepageData | null }>("/homepage", {
      next: { revalidate: 60, tags: [CMS_CACHE_TAGS.homepage] },
    }),
  getModules: () => api<{ data: BusinessModule[] }>("/modules"),
  search: (q: string, module?: string) =>
    api<{ data: SearchResult[] }>(
      `/search?q=${encodeURIComponent(q)}${module ? `&module=${module}` : ""}`,
    ),

  login: (email: string, password: string) =>
    api<{ data: AuthResponse }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (payload: RegisterPayload) =>
    api<{ data: AuthResponse }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  forgotPassword: (email: string) =>
    api<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  me: (token: string) =>
    api<{ data: User }>("/auth/me", { token }),

  logout: (token: string) =>
    api<{ message: string }>("/auth/logout", { method: "POST", token }),

  updateProfile: (token: string, payload: ProfilePayload) =>
    api<{ data: User }>("/auth/profile", {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    }),

  uploadAvatar: async (token: string, file: File) => {
    const form = new FormData();
    form.append("avatar", file);
    const url = `${getApiUrl()}/auth/avatar`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Upload failed" }));
      throw new ApiError(response.status, error.message ?? "Upload failed");
    }
    return response.json() as Promise<{ data: User }>;
  },

  removeAvatar: (token: string) =>
    api<{ data: User }>("/auth/avatar", { method: "DELETE", token }),

  uploadCmsMedia: async (token: string, file: File, type: "image" | "video" = "image") => {
    const form = new FormData();
    form.append("file", file);
    form.append("type", type);
    const url = `${getApiUrl()}/cms/media`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Upload failed" }));
      throw new ApiError(response.status, error.message ?? "Upload failed");
    }
    return response.json() as Promise<{ data: { url: string; path: string; type: string } }>;
  },

  getAdminContext: (token: string) =>
    api<{ data: AdminContext }>("/admin/context", { token }),

  getDashboard: (token: string) =>
    api<{ data: DashboardData }>("/admin/dashboard", { token }),

  updateHomepage: (token: string, payload: HomepageUpdatePayload) =>
    api<{ message: string }>("/cms/homepage", {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    }),

  getDivisionNav: () =>
    api<{ data: DivisionNavItem[] }>("/divisions", {
      next: { revalidate: 60, tags: [CMS_CACHE_TAGS.divisions] },
    }),

  getDivisionPage: (slug: string) =>
    api<{ data: DivisionPageData }>(`/divisions/${slug}`, {
      next: { revalidate: 60, tags: [CMS_CACHE_TAGS.divisions, CMS_CACHE_TAGS.division(slug)] },
    }),

  getAdminDivisionPages: (token: string) =>
    api<{ data: DivisionPageData[] }>("/cms/admin/divisions", { token }),

  getAdminDivisionPage: (token: string, slug: string) =>
    api<{ data: DivisionPageData }>(`/cms/admin/divisions/${slug}`, { token }),

  createDivisionPage: (token: string, payload: DivisionPageCreatePayload) =>
    api<{ message: string; data: DivisionPageData }>("/cms/admin/divisions", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),

  updateDivisionPage: (token: string, slug: string, payload: DivisionPagePayload) =>
    api<{ message: string; data: DivisionPageData }>(`/cms/admin/divisions/${slug}`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    }),

  deleteDivisionPage: (token: string, slug: string) =>
    api<{ message: string }>(`/cms/admin/divisions/${slug}`, { method: "DELETE", token }),

  getTourPackages: (params?: CatalogListParams) =>
    api<Paginated<TourPackage>>(`/tours/packages${catalogQuery(params)}`, {
      next: { revalidate: 60, tags: [OFFERINGS_CACHE_TAGS.tours] },
    }),

  getTourPackage: (slug: string) =>
    api<{ data: TourPackage }>(`/tours/packages/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60, tags: [OFFERINGS_CACHE_TAGS.tours, OFFERINGS_CACHE_TAGS.tour(slug)] },
    }),

  getShopProducts: (params?: CatalogListParams) =>
    api<Paginated<Product>>(`/shop/products${catalogQuery(params)}`, {
      next: { revalidate: 60, tags: [OFFERINGS_CACHE_TAGS.shop] },
    }),

  getShopProduct: (slug: string) =>
    api<{ data: Product }>(`/shop/products/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60, tags: [OFFERINGS_CACHE_TAGS.shop, OFFERINGS_CACHE_TAGS.product(slug)] },
    }),

  getAcademyCourses: (params?: CatalogListParams) =>
    api<Paginated<Course>>(`/academy/courses${catalogQuery(params)}`, {
      next: { revalidate: 60, tags: [OFFERINGS_CACHE_TAGS.academy] },
    }),

  getAcademyCourse: (slug: string) =>
    api<{ data: Course }>(`/academy/courses/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60, tags: [OFFERINGS_CACHE_TAGS.academy, OFFERINGS_CACHE_TAGS.course(slug)] },
    }),

  getAcademyCategories: () => api<{ data: AcademyCategory[] }>("/academy/categories"),

  getAdminAcademyCategories: (token: string) =>
    api<{ data: AcademyCategory[] }>("/academy/admin/categories", { token }),

  createAcademyCategory: (token: string, payload: CategoryPayload) =>
    api<{ data: AcademyCategory }>("/academy/admin/categories", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),

  getAdminCourses: (token: string, params?: { status?: string; search?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    if (params?.page) query.set("page", String(params.page));
    const qs = query.toString();
    return api<Paginated<Course>>(`/academy/admin/courses${qs ? `?${qs}` : ""}`, { token });
  },

  getAdminCourse: (token: string, id: number) =>
    api<{ data: Course }>(`/academy/admin/courses/${id}`, { token }),

  createCourse: (token: string, payload: CoursePayload) =>
    api<{ data: Course }>("/academy/courses", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),

  updateCourse: (token: string, id: number, payload: Partial<CoursePayload & { status: string }>) =>
    api<{ data: Course }>(`/academy/courses/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    }),

  getEnrollments: (token: string) =>
    api<{ data: Enrollment[] } | Paginated<Enrollment>>("/academy/enrollments", { token }),

  // Shop
  getShopCategories: () => api<{ data: ShopCategory[] }>("/shop/categories"),

  getAdminShopCategories: (token: string) =>
    api<{ data: ShopCategory[] }>("/shop/admin/categories", { token }),

  createShopCategory: (token: string, payload: CategoryPayload) =>
    api<{ data: ShopCategory }>("/shop/admin/categories", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),
  getAdminProducts: (token: string) =>
    api<Paginated<Product>>(`/shop/admin/products`, { token }),
  getAdminProduct: (token: string, id: number) =>
    api<{ data: Product }>(`/shop/admin/products/${id}`, { token }),
  createProduct: (token: string, payload: ProductPayload) =>
    api<{ data: Product }>("/shop/products", { method: "POST", token, body: JSON.stringify(payload) }),
  updateProduct: (token: string, id: number, payload: Partial<ProductPayload & { is_active: boolean; is_featured: boolean }>) =>
    api<{ data: Product }>(`/shop/products/${id}`, { method: "PUT", token, body: JSON.stringify(payload) }),

  // Tours
  getAdminPackages: (token: string) =>
    api<Paginated<TourPackage>>(`/tours/admin/packages`, { token }),
  getAdminPackage: (token: string, id: number) =>
    api<{ data: TourPackage }>(`/tours/admin/packages/${id}`, { token }),
  createPackage: (token: string, payload: PackagePayload) =>
    api<{ data: TourPackage }>("/tours/packages", { method: "POST", token, body: JSON.stringify(payload) }),
  updatePackage: (token: string, id: number, payload: Partial<PackagePayload & { is_active: boolean; is_featured: boolean }>) =>
    api<{ data: TourPackage }>(`/tours/packages/${id}`, { method: "PUT", token, body: JSON.stringify(payload) }),
  getItinerary: (token: string, packageId: number) =>
    api<{ data: ItineraryDay[] }>(`/tours/admin/packages/${packageId}/itinerary`, { token }),
  createItineraryDay: (token: string, packageId: number, payload: ItineraryPayload) =>
    api<{ data: ItineraryDay }>(`/tours/admin/packages/${packageId}/itinerary`, { method: "POST", token, body: JSON.stringify(payload) }),
  updateItineraryDay: (token: string, packageId: number, dayId: number, payload: Partial<ItineraryPayload>) =>
    api<{ data: ItineraryDay }>(`/tours/admin/packages/${packageId}/itinerary/${dayId}`, { method: "PUT", token, body: JSON.stringify(payload) }),
  deleteItineraryDay: (token: string, packageId: number, dayId: number) =>
    api<{ message: string }>(`/tours/admin/packages/${packageId}/itinerary/${dayId}`, { method: "DELETE", token }),

  // Settings
  getAdminModules: (token: string) =>
    api<{ data: AdminModule[] }>("/admin/modules", { token }),
  updateModule: (token: string, id: number, payload: { is_enabled?: boolean; name?: string; description?: string }) =>
    api<{ data: AdminModule }>(`/admin/modules/${id}`, { method: "PUT", token, body: JSON.stringify(payload) }),
  getRoles: (token: string) =>
    api<{ data: string[] }>("/admin/roles", { token }),
  getAdminBranches: (token: string) =>
    api<{ data: AdminBranch[] }>("/admin/branches", { token }),
  getAdminUser: (token: string, id: number) =>
    api<{ data: AdminUser }>(`/admin/users/${id}`, { token }),
  createUser: (token: string, payload: UserPayload) =>
    api<{ data: AdminUser }>("/admin/users", { method: "POST", token, body: JSON.stringify(payload) }),
  updateUser: (token: string, id: number, payload: Partial<UserPayload>) =>
    api<{ data: AdminUser }>(`/admin/users/${id}`, { method: "PUT", token, body: JSON.stringify(payload) }),
  deleteUser: (token: string, id: number) =>
    api<{ message: string }>(`/admin/users/${id}`, { method: "DELETE", token }),
  uploadUserAvatar: async (token: string, userId: number, file: File) => {
    const form = new FormData();
    form.append("avatar", file);
    const url = `${getApiUrl()}/admin/users/${userId}/avatar`;
    const response = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      body: form,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: "Upload failed" }));
      throw new ApiError(response.status, err.message ?? "Upload failed");
    }
    return response.json() as Promise<{ data: AdminUser }>;
  },
  removeUserAvatar: (token: string, userId: number) =>
    api<{ data: AdminUser }>(`/admin/users/${userId}/avatar`, { method: "DELETE", token }),
  getAdminUsers: (token: string, params?: UserListParams) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.role) query.set("role", params.role);
    if (params?.sort) query.set("sort", params.sort);
    if (params?.dir) query.set("dir", params.dir);
    if (params?.page) query.set("page", String(params.page));
    if (params?.per_page) query.set("per_page", String(params.per_page));
    const qs = query.toString();
    return api<Paginated<AdminUser> & { stats?: UserListStats }>(`/admin/users${qs ? `?${qs}` : ""}`, { token });
  },
  getAdminPreferences: (token: string) =>
    api<{ data: AdminPreferencesPayload | null }>("/admin/settings/admin_preferences", { token }),
  updateAdminPreferences: (token: string, value: AdminPreferencesPayload) =>
    api<{ data: AdminPreferencesPayload }>("/admin/settings/admin_preferences", {
      method: "PUT",
      token,
      body: JSON.stringify({ value }),
    }),
  getAdvertisements: (token: string) =>
    api<{ data: Advertisement[] }>("/admin/settings/advertisements", { token }),
  updateAdvertisements: (token: string, value: Advertisement[]) =>
    api<{ data: Advertisement[] }>("/admin/settings/advertisements", {
      method: "PUT",
      token,
      body: JSON.stringify({ value }),
    }),
  getPublicAds: (placement?: string) => {
    const qs = placement ? `?placement=${encodeURIComponent(placement)}` : "";
    return api<{ data: Advertisement[]; revision?: string | null }>(`/ads${qs}`, { cache: "no-store" });
  },
  getBrand: () => api<{ data: BrandOverride | null; revision?: string | null }>("/brand", { cache: "no-store" }),
  getAdminBrand: (token: string) =>
    api<{ data: BrandOverride | null }>("/admin/settings/brand", { token }),
  updateAdminBrand: (token: string, value: BrandOverride) =>
    api<{ data: BrandOverride }>("/admin/settings/brand", {
      method: "PUT",
      token,
      body: JSON.stringify({ value }),
    }),

  // CMS Pages
  getPublicPage: (slug: string) =>
    api<{ data: CmsPage }>(`/cms/pages/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60, tags: [CMS_CACHE_TAGS.pages, CMS_CACHE_TAGS.page(slug)] },
    }),
  getAdminPages: (token: string) =>
    api<Paginated<CmsPage>>(`/cms/admin/pages`, { token }),
  getAdminPage: (token: string, id: number) =>
    api<{ data: CmsPage }>(`/cms/admin/pages/${id}`, { token }),
  createPage: (token: string, payload: PagePayload) =>
    api<{ data: CmsPage }>("/cms/pages", { method: "POST", token, body: JSON.stringify(payload) }),
  updatePage: (token: string, id: number, payload: Partial<PagePayload>) =>
    api<{ data: CmsPage }>(`/cms/pages/${id}`, { method: "PUT", token, body: JSON.stringify(payload) }),
  deletePage: (token: string, id: number) =>
    api<{ message: string }>(`/cms/pages/${id}`, { method: "DELETE", token }),
  createPageSection: (token: string, pageId: number, payload: SectionPayload) =>
    api<{ data: PageSection }>(`/cms/admin/pages/${pageId}/sections`, { method: "POST", token, body: JSON.stringify(payload) }),
  updatePageSection: (token: string, pageId: number, sectionId: number, payload: Partial<SectionPayload>) =>
    api<{ data: PageSection }>(`/cms/admin/pages/${pageId}/sections/${sectionId}`, { method: "PUT", token, body: JSON.stringify(payload) }),
  deletePageSection: (token: string, pageId: number, sectionId: number) =>
    api<{ message: string }>(`/cms/admin/pages/${pageId}/sections/${sectionId}`, { method: "DELETE", token }),
  reorderPageSections: (token: string, pageId: number, sections: { id: number; sort_order: number }[]) =>
    api<{ data: PageSection[] }>(`/cms/admin/pages/${pageId}/sections/reorder`, { method: "PUT", token, body: JSON.stringify({ sections }) }),

  // Tasks & calendar
  getAdminTasks: (token: string, params?: { from?: string; to?: string; date?: string; status?: AdminTaskStatus }) => {
    const query = new URLSearchParams();
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);
    if (params?.date) query.set("date", params.date);
    if (params?.status) query.set("status", params.status);
    const qs = query.toString();
    return api<{ data: AdminTask[] }>(`/admin/tasks${qs ? `?${qs}` : ""}`, { token });
  },
  createAdminTask: (token: string, payload: AdminTaskPayload) =>
    api<{ data: AdminTask }>("/admin/tasks", { method: "POST", token, body: JSON.stringify(payload) }),
  updateAdminTask: (token: string, id: number, payload: Partial<AdminTaskPayload>) =>
    api<{ data: AdminTask }>(`/admin/tasks/${id}`, { method: "PUT", token, body: JSON.stringify(payload) }),
  deleteAdminTask: (token: string, id: number) =>
    api<{ message: string }>(`/admin/tasks/${id}`, { method: "DELETE", token }),
};

export interface HomepageData {
  hero: {
    heading: string | null;
    subheading: string | null;
    background_type: string;
    background_url: string | null;
    video_url: string | null;
    cta_text: string | null;
    cta_url: string | null;
  };
  entry_cards: EntryCard[];
  meta: Record<string, unknown>;
}

export interface HomepageUpdatePayload {
  hero_heading?: string;
  hero_subheading?: string;
  hero_background_type?: string;
  hero_background_url?: string;
  hero_video_url?: string;
  hero_cta_text?: string;
  hero_cta_url?: string;
  entry_cards?: EntryCard[];
  meta?: Record<string, unknown>;
}

export type DivisionAccentStyle =
  | "accent"
  | "emerald"
  | "orange"
  | "rose"
  | "blue"
  | "amber"
  | "violet";

export interface DivisionNavItem {
  slug: string;
  nav_label: string;
  icon: string;
  public_path: string;
  sort_order: number;
  show_in_nav: boolean;
}

export interface DivisionHighlightCard {
  title: string;
  description: string;
  icon: string;
  link_url?: string;
  link_label?: string;
}

export interface DivisionPageData {
  slug: string;
  nav_label: string;
  sort_order: number;
  show_in_nav: boolean;
  public_path: string;
  badge: string;
  title: string;
  description: string;
  icon: string;
  accent_style: DivisionAccentStyle;
  home_gradient: string | null;
  highlight_cards: DivisionHighlightCard[];
  footer_note: string | null;
  meta: Record<string, unknown>;
  is_active?: boolean;
}

export interface DivisionPagePayload {
  nav_label?: string;
  badge?: string;
  title?: string;
  description?: string;
  icon?: string;
  accent_style?: DivisionAccentStyle;
  home_gradient?: string | null;
  show_in_nav?: boolean;
  sort_order?: number;
  highlight_cards?: DivisionHighlightCard[];
  footer_note?: string | null;
  meta?: Record<string, unknown>;
  is_active?: boolean;
}

export interface DivisionPageCreatePayload extends DivisionPagePayload {
  slug: string;
  nav_label: string;
  badge: string;
  title: string;
  description: string;
}

export interface EntryCard {
  slug: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  gradient: string;
}

export interface BusinessModule {
  slug: string;
  name: string;
  enabled: boolean;
}

export interface SearchResult {
  id: number;
  title: string;
  content: string;
  module: string;
  url: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  roles?: { name: string }[];
  permissions?: { name: string }[];
}

export interface ProfilePayload {
  name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface NavItem {
  label: string;
  href?: string;
  icon?: string;
  children?: { label: string; href: string; icon?: string }[];
  visible?: boolean;
}

export interface AdminContext {
  user: User;
  roles: string[];
  permissions: string[];
  modules: BusinessModule[];
  navigation: NavItem[];
}

export interface DashboardData {
  stats: {
    users: number;
    enrollments: number;
    orders: number;
    bookings: number;
    enquiries: number;
    revenue: number;
  };
  recent: {
    orders: { id: number; order_number: string; total: string; status: string; created_at: string }[];
    enrollments: Enrollment[];
    bookings: { id: number; booking_number: string; status: string; total_amount: string; created_at: string }[];
  };
  modules: { slug: string; name: string; is_enabled: boolean }[];
}

export interface AcademyCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

export interface CategoryPayload {
  name: string;
  description?: string;
}

export interface CourseBatch {
  id: number;
  name: string;
  start_date: string;
  end_date?: string | null;
  status: string;
  trainer?: { name: string } | null;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  duration: string | null;
  fees: string;
  status: string;
  category_id: number;
  category?: AcademyCategory;
  requires_approval?: boolean;
  thumbnail?: string | null;
  gallery?: string[] | null;
  batches?: CourseBatch[];
  seo_title?: string | null;
  seo_description?: string | null;
}

export interface CoursePayload {
  category_id: number;
  title: string;
  description?: string;
  duration?: string;
  fees: number;
  requires_approval?: boolean;
}

export interface Enrollment {
  id: number;
  status: string;
  payment_status: string;
  user?: User;
  batch?: { course?: { title: string } };
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export interface CatalogListParams {
  featured?: boolean;
  category?: string;
  page?: number;
  per_page?: number;
}

function catalogQuery(params?: CatalogListParams): string {
  if (!params) return "";
  const query = new URLSearchParams();
  if (params.featured) query.set("featured", "1");
  if (params.category) query.set("category", params.category);
  if (params.page) query.set("page", String(params.page));
  if (params.per_page) query.set("per_page", String(params.per_page));
  const value = query.toString();
  return value ? `?${value}` : "";
}

export interface ShopCategory {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: number | null;
  is_active?: boolean;
  sort_order?: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: string;
  compare_price?: string | null;
  stock: number;
  description: string | null;
  images?: string[] | null;
  is_active: boolean;
  is_featured: boolean;
  category_id: number;
  category?: ShopCategory;
  seo_title?: string | null;
  seo_description?: string | null;
}

export interface ProductPayload {
  category_id: number;
  name: string;
  description?: string;
  sku: string;
  price: number;
  stock: number;
}

export interface TourPackage {
  id: number;
  title: string;
  slug: string;
  destination: string;
  type: string;
  duration_days: number;
  price: string;
  description: string | null;
  gallery?: string[] | null;
  inclusions?: string[] | null;
  exclusions?: string[] | null;
  is_active: boolean;
  is_featured: boolean;
  itinerary_days?: ItineraryDay[];
  seo_title?: string | null;
  seo_description?: string | null;
}

export interface PackagePayload {
  title: string;
  description?: string;
  destination: string;
  type: string;
  duration_days: number;
  price: number;
}

export interface ItineraryDay {
  id: number;
  package_id: number;
  day_number: number;
  title: string;
  description: string | null;
  activities: string[] | null;
  accommodation: string | null;
  meals: string[] | null;
}

export interface ItineraryPayload {
  day_number: number;
  title: string;
  description?: string;
  activities?: string[];
  accommodation?: string;
  meals?: string[];
}

export interface AdminModule {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  is_enabled: boolean;
  sort_order: number;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar?: string | null;
  avatar_url?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
  branch_id?: number | null;
  email_verified_at?: string | null;
  phone_verified_at?: string | null;
  two_factor_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
  branch?: { id: number; name: string } | null;
  roles: { name: string }[];
  permissions?: { name: string }[];
}

export interface AdminBranch {
  id: number;
  name: string;
  city?: string | null;
  country?: string | null;
}

export interface UserListParams {
  search?: string;
  role?: string;
  sort?: "created_at" | "name" | "email" | "updated_at";
  dir?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

export interface UserListStats {
  total: number;
  by_role: Record<string, number>;
}

export interface AdminPreferencesPayload {
  notifications: {
    enabled: boolean;
    position: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
    defaultDurationMs: number;
    showProgressBar: boolean;
    showCountdown: boolean;
  };
  hotkeys: {
    save: string;
    search: string;
    help: string;
    hotkeys: string;
    new: string;
    close: string;
    sidebar: string;
  };
  tour: {
    autoStart: boolean;
  };
  theme?: {
    mode: "dark" | "light";
    accent: "violet" | "blue" | "emerald" | "rose" | "amber";
  };
}

export type AdPlacement = "floating_left" | "floating_right" | "top_strip" | "homepage" | "footer";

export interface BrandOverride {
  name?: string;
  shortName?: string;
  tagline?: string;
  description?: string;
  logos?: {
    horizontal?: string;
    vertical?: string;
    icon?: string;
    mobile?: string;
  };
  logoDisplay?: {
    iconBlend?: boolean;
  };
}

export interface Advertisement {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  placement: AdPlacement;
  enabled: boolean;
  sort_order: number;
  /** When true (default), visitors can dismiss the ad; stored in localStorage per browser. */
  dismissible?: boolean;
}

export interface UserPayload {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: string;
  branch_id?: number;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface CmsPage {
  id: number;
  title: string;
  slug: string;
  type: string;
  status: string;
  excerpt: string | null;
  sections?: PageSection[];
}

export interface PagePayload {
  title: string;
  type?: string;
  excerpt?: string;
  status?: string;
}

export interface PageSection {
  id: number;
  page_id: number;
  component_type: string;
  content: Record<string, unknown>;
  sort_order: number;
  is_visible: boolean;
}

export interface SectionPayload {
  component_type: string;
  content: Record<string, unknown>;
  is_visible?: boolean;
}

export type AdminTaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type AdminTaskPriority = "low" | "medium" | "high";

export interface AdminTask {
  id: number;
  user_id: number;
  branch_id: number | null;
  title: string;
  description: string | null;
  due_at: string | null;
  status: AdminTaskStatus;
  priority: AdminTaskPriority;
  created_at: string;
  updated_at: string;
  user?: { id: number; name: string };
}

export interface AdminTaskPayload {
  title: string;
  description?: string | null;
  due_at?: string | null;
  status?: AdminTaskStatus;
  priority?: AdminTaskPriority;
}

export const SECTION_TYPES = [
  { value: "banner", label: "Banner" },
  { value: "text", label: "Text" },
  { value: "gallery", label: "Gallery" },
  { value: "faq", label: "FAQ" },
  { value: "video", label: "Video" },
  { value: "cards", label: "Cards" },
  { value: "stats", label: "Quick facts" },
  { value: "inclusions", label: "Inclusions & Exclusions" },
  { value: "itinerary", label: "Timeline" },
  { value: "testimonials", label: "Testimonials" },
  { value: "map", label: "Map" },
  { value: "forms", label: "Forms" },
] as const;

export function sectionTypeLabel(type: string): string {
  return SECTION_TYPES.find((entry) => entry.value === type)?.label ?? type;
}

export function hasPermission(permissions: string[], required: string | string[]): boolean {
  const requiredList = Array.isArray(required) ? required : [required];
  return requiredList.some((p) => permissions.includes(p));
}

export function hasAdminAccess(roles: string[], permissions: string[]): boolean {
  const adminRoles = ["super-admin", "academy-manager", "shop-manager", "travel-manager", "trainer"];
  if (roles.some((r) => adminRoles.includes(r))) return true;
  const adminPerms = permissions.filter((p) => !p.endsWith(".use") && p !== "ai.chat.use");
  return adminPerms.length > 0;
}

export function getUserRoles(user: User): string[] {
  return user.roles?.map((r) => r.name) ?? [];
}

export function getUserPermissions(user: User): string[] {
  return user.permissions?.map((p) => p.name) ?? [];
}

export function isCustomerUser(roles: string[]): boolean {
  return roles.includes("customer") && !hasAdminAccess(roles, []);
}
