const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

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
};

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { token, cache, ...init } = options;
  const url = `${API_URL}${endpoint}`;

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
    next: token ? undefined : { revalidate: 60 },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new ApiError(response.status, error.message ?? "Request failed");
  }

  return response.json();
}

export const apiClient = {
  getHomepage: () => api<{ data: HomepageData | null }>("/homepage"),
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

  me: (token: string) =>
    api<{ data: User }>("/auth/me", { token }),

  logout: (token: string) =>
    api<{ message: string }>("/auth/logout", { method: "POST", token }),

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

  getAcademyCategories: () => api<{ data: AcademyCategory[] }>("/academy/categories"),

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
  getAdminUsers: (token: string) =>
    api<Paginated<AdminUser>>(`/admin/users`, { token }),
  getRoles: (token: string) =>
    api<{ data: string[] }>("/admin/roles", { token }),
  createUser: (token: string, payload: UserPayload) =>
    api<{ data: AdminUser }>("/admin/users", { method: "POST", token, body: JSON.stringify(payload) }),
  updateUser: (token: string, id: number, payload: Partial<UserPayload>) =>
    api<{ data: AdminUser }>(`/admin/users/${id}`, { method: "PUT", token, body: JSON.stringify(payload) }),
  deleteUser: (token: string, id: number) =>
    api<{ message: string }>(`/admin/users/${id}`, { method: "DELETE", token }),

  // CMS Pages
  getAdminPages: (token: string) =>
    api<Paginated<CmsPage>>(`/cms/admin/pages`, { token }),
  getAdminPage: (token: string, id: number) =>
    api<{ data: CmsPage }>(`/cms/admin/pages/${id}`, { token }),
  createPage: (token: string, payload: PagePayload) =>
    api<{ data: CmsPage }>("/cms/pages", { method: "POST", token, body: JSON.stringify(payload) }),
  updatePage: (token: string, id: number, payload: Partial<PagePayload>) =>
    api<{ data: CmsPage }>(`/cms/pages/${id}`, { method: "PUT", token, body: JSON.stringify(payload) }),
  createPageSection: (token: string, pageId: number, payload: SectionPayload) =>
    api<{ data: PageSection }>(`/cms/admin/pages/${pageId}/sections`, { method: "POST", token, body: JSON.stringify(payload) }),
  updatePageSection: (token: string, pageId: number, sectionId: number, payload: Partial<SectionPayload>) =>
    api<{ data: PageSection }>(`/cms/admin/pages/${pageId}/sections/${sectionId}`, { method: "PUT", token, body: JSON.stringify(payload) }),
  deletePageSection: (token: string, pageId: number, sectionId: number) =>
    api<{ message: string }>(`/cms/admin/pages/${pageId}/sections/${sectionId}`, { method: "DELETE", token }),
  reorderPageSections: (token: string, pageId: number, sections: { id: number; sort_order: number }[]) =>
    api<{ data: PageSection[] }>(`/cms/admin/pages/${pageId}/sections/reorder`, { method: "PUT", token, body: JSON.stringify({ sections }) }),
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
  roles?: { name: string }[];
  permissions?: { name: string }[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface NavItem {
  label: string;
  href?: string;
  icon?: string;
  children?: { label: string; href: string }[];
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

export interface ShopCategory {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: string;
  stock: number;
  description: string | null;
  is_active: boolean;
  is_featured: boolean;
  category_id: number;
  category?: ShopCategory;
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
  is_active: boolean;
  is_featured: boolean;
  itinerary_days?: ItineraryDay[];
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
  roles: { name: string }[];
}

export interface UserPayload {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: string;
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

export const SECTION_TYPES = [
  { value: "banner", label: "Banner" },
  { value: "text", label: "Text" },
  { value: "gallery", label: "Gallery" },
  { value: "faq", label: "FAQ" },
  { value: "video", label: "Video" },
  { value: "cards", label: "Cards" },
  { value: "testimonials", label: "Testimonials" },
  { value: "map", label: "Map" },
  { value: "forms", label: "Forms" },
] as const;

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
