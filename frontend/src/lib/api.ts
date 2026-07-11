import { CMS_CACHE_TAGS, OFFERINGS_CACHE_TAGS } from "@/lib/cms-cache-tags";

/** True during `next build` — Docker internal API hostnames are not reachable yet. */
export function isNextProductionBuild(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

function getApiUrl(): string {
  // Browser must use localhost — "backend" only resolves inside Docker network
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
  }
  // INTERNAL_API_URL (e.g. http://backend:8000) works at runtime in compose, not during image build
  if (!isNextProductionBuild() && process.env.INTERNAL_API_URL) {
    return process.env.INTERNAL_API_URL;
  }
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
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
      throw new ApiError(response.status, formatApiErrorMessage(error));
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

  getRelatedTourPackages: (slug: string, limit = 3) =>
    api<{ data: TourPackage[] }>(`/tours/packages/${encodeURIComponent(slug)}/related?limit=${limit}`, {
      next: { revalidate: 60, tags: [OFFERINGS_CACHE_TAGS.tours, OFFERINGS_CACHE_TAGS.tour(slug)] },
    }),

  getTrendingTourPackages: (limit = 6) =>
    api<{ data: TourPackage[] }>(`/tours/trending?limit=${limit}`, {
      next: { revalidate: 60, tags: [OFFERINGS_CACHE_TAGS.tours] },
    }),

  getShopProducts: (params?: ShopCatalogListParams) =>
    api<Paginated<Product>>(`/shop/products${shopCatalogQuery(params)}`, {
      next: { revalidate: 60, tags: [OFFERINGS_CACHE_TAGS.shop] },
    }),

  getShopProduct: (slug: string) =>
    api<{ data: Product }>(`/shop/products/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60, tags: [OFFERINGS_CACHE_TAGS.shop, OFFERINGS_CACHE_TAGS.product(slug)] },
    }),

  getRelatedShopProducts: (slug: string, limit = 3) =>
    api<{ data: Product[] }>(`/shop/products/${encodeURIComponent(slug)}/related?limit=${limit}`, {
      next: { revalidate: 60, tags: [OFFERINGS_CACHE_TAGS.shop, OFFERINGS_CACHE_TAGS.product(slug)] },
    }),

  getTrendingShopProducts: (limit = 6) =>
    api<{ data: Product[] }>(`/shop/trending?limit=${limit}`, {
      next: { revalidate: 60, tags: [OFFERINGS_CACHE_TAGS.shop] },
    }),

  getAcademyCourses: (params?: CatalogListParams) =>
    api<Paginated<Course>>(`/academy/courses${catalogQuery(params)}`, {
      next: { revalidate: 60, tags: [OFFERINGS_CACHE_TAGS.academy] },
    }),

  getAcademyCourse: (slug: string) =>
    api<{ data: Course }>(`/academy/courses/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60, tags: [OFFERINGS_CACHE_TAGS.academy, OFFERINGS_CACHE_TAGS.course(slug)] },
    }),

  getRelatedAcademyCourses: (slug: string, limit = 3) =>
    api<{ data: Course[] }>(`/academy/courses/${encodeURIComponent(slug)}/related?limit=${limit}`, {
      next: { revalidate: 60, tags: [OFFERINGS_CACHE_TAGS.academy, OFFERINGS_CACHE_TAGS.course(slug)] },
    }),

  getTrendingAcademyCourses: (limit = 6) =>
    api<{ data: Course[] }>(`/academy/trending?limit=${limit}`, {
      next: { revalidate: 60, tags: [OFFERINGS_CACHE_TAGS.academy] },
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

  updateCourse: (token: string, id: number, payload: Partial<CoursePayload & { status: string; gallery?: string[]; thumbnail?: string; seo_title?: string; seo_description?: string; is_featured?: boolean; related_slugs?: string[] }>) =>
    api<{ data: Course }>(`/academy/courses/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    }),

  getCourseBatches: (token: string, courseId: number) =>
    api<{ data: CourseBatch[] }>(`/academy/admin/courses/${courseId}/batches`, { token }),

  createCourseBatch: (
    token: string,
    courseId: number,
    payload: CourseBatchPayload,
  ) =>
    api<{ data: CourseBatch }>(`/academy/admin/courses/${courseId}/batches`, {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),

  updateCourseBatch: (
    token: string,
    courseId: number,
    batchId: number,
    payload: Partial<CourseBatchPayload>,
  ) =>
    api<{ data: CourseBatch }>(`/academy/admin/courses/${courseId}/batches/${batchId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    }),

  deleteCourseBatch: (token: string, courseId: number, batchId: number) =>
    api<{ message: string }>(`/academy/admin/courses/${courseId}/batches/${batchId}`, {
      method: "DELETE",
      token,
    }),

  getEnrollments: (token: string) =>
    api<{ data: Enrollment[] } | Paginated<Enrollment>>("/academy/enrollments", { token }),

  updateEnrollment: (
    token: string,
    id: number,
    payload: Partial<{ status: string; payment_status: string; payment_reference: string; amount_paid: number }>,
  ) =>
    api<{ data: Enrollment }>(`/academy/admin/enrollments/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    }),

  createEnrollment: (token: string, payload: { batch_id: number }) =>
    api<{ data: Enrollment }>("/academy/enrollments", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),

  getAdminTrainers: (token: string) =>
    api<Paginated<Trainer>>(`/academy/admin/trainers`, { token }),

  getAdminTrainer: (token: string, id: number) =>
    api<{ data: Trainer }>(`/academy/admin/trainers/${id}`, { token }),

  createTrainer: (token: string, payload: TrainerPayload) =>
    api<{ data: Trainer }>("/academy/admin/trainers", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),

  updateTrainer: (token: string, id: number, payload: Partial<TrainerPayload & { is_active: boolean }>) =>
    api<{ data: Trainer }>(`/academy/admin/trainers/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    }),

  deleteTrainer: (token: string, id: number) =>
    api<{ message: string }>(`/academy/admin/trainers/${id}`, {
      method: "DELETE",
      token,
    }),

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
  updateProduct: (token: string, id: number, payload: Partial<ProductPayload & { is_active: boolean; is_featured: boolean; images?: string[]; compare_price?: number | null; seo_title?: string; seo_description?: string; related_slugs?: string[] }>) =>
    api<{ data: Product }>(`/shop/products/${id}`, { method: "PUT", token, body: JSON.stringify(payload) }),

  getProductVariants: (token: string, productId: number) =>
    api<{ data: ProductVariant[] }>(`/shop/admin/products/${productId}/variants`, { token }),

  createProductVariant: (token: string, productId: number, payload: ProductVariantPayload) =>
    api<{ data: ProductVariant }>(`/shop/admin/products/${productId}/variants`, {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),

  updateProductVariant: (
    token: string,
    productId: number,
    variantId: number,
    payload: Partial<ProductVariantPayload>,
  ) =>
    api<{ data: ProductVariant }>(`/shop/admin/products/${productId}/variants/${variantId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    }),

  deleteProductVariant: (token: string, productId: number, variantId: number) =>
    api<{ message: string }>(`/shop/admin/products/${productId}/variants/${variantId}`, {
      method: "DELETE",
      token,
    }),

  getCart: (token: string) =>
    api<{ data: Cart }>("/shop/cart", { token }),

  addCartItem: (
    token: string,
    payload: { product_id: number; variant_id?: number | null; quantity: number },
  ) =>
    api<{ data: Cart }>("/shop/cart/items", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),

  removeCartItem: (token: string, itemId: number) =>
    api<{ data: Cart }>(`/shop/cart/items/${itemId}`, {
      method: "DELETE",
      token,
    }),

  createOrder: (
    token: string,
    payload: {
      shipping_address: Record<string, string>;
      billing_address?: Record<string, string> | null;
      coupon_code?: string;
    },
  ) =>
    api<{ data: ShopOrder }>("/shop/orders", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),

  getOrders: (token: string) => api<Paginated<ShopOrder>>("/shop/orders", { token }),

  getOrder: (token: string, id: number) =>
    api<{ data: ShopOrder }>(`/shop/orders/${id}`, { token }),

  getAdminOrders: (token: string, params?: { status?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.page) query.set("page", String(params.page));
    const qs = query.toString();
    return api<Paginated<ShopOrder>>(`/shop/admin/orders${qs ? `?${qs}` : ""}`, { token });
  },

  updateAdminOrder: (
    token: string,
    id: number,
    payload: Partial<{ status: string; payment_status: string; payment_reference: string; tracking_number: string }>,
  ) =>
    api<{ data: ShopOrder }>(`/shop/admin/orders/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    }),

  // Tours
  getAdminPackages: (token: string) =>
    api<Paginated<TourPackage>>(`/tours/admin/packages`, { token }),
  getAdminPackage: (token: string, id: number) =>
    api<{ data: TourPackage }>(`/tours/admin/packages/${id}`, { token }),
  createPackage: (token: string, payload: PackagePayload) =>
    api<{ data: TourPackage }>("/tours/packages", { method: "POST", token, body: JSON.stringify(payload) }),
  updatePackage: (token: string, id: number, payload: Partial<PackagePayload & { is_active: boolean; is_featured: boolean; gallery?: string[]; inclusions?: string[]; exclusions?: string[]; seo_title?: string; seo_description?: string; related_slugs?: string[] }>) =>
    api<{ data: TourPackage }>(`/tours/packages/${id}`, { method: "PUT", token, body: JSON.stringify(payload) }),
  getItinerary: (token: string, packageId: number) =>
    api<{ data: ItineraryDay[] }>(`/tours/admin/packages/${packageId}/itinerary`, { token }),
  createItineraryDay: (token: string, packageId: number, payload: ItineraryPayload) =>
    api<{ data: ItineraryDay }>(`/tours/admin/packages/${packageId}/itinerary`, { method: "POST", token, body: JSON.stringify(payload) }),
  updateItineraryDay: (token: string, packageId: number, dayId: number, payload: Partial<ItineraryPayload>) =>
    api<{ data: ItineraryDay }>(`/tours/admin/packages/${packageId}/itinerary/${dayId}`, { method: "PUT", token, body: JSON.stringify(payload) }),
  deleteItineraryDay: (token: string, packageId: number, dayId: number) =>
    api<{ message: string }>(`/tours/admin/packages/${packageId}/itinerary/${dayId}`, { method: "DELETE", token }),
  reorderItineraryDays: (token: string, packageId: number, days: Array<{ id: number; day_number: number }>) =>
    api<{ data: ItineraryDay[] }>(`/tours/admin/packages/${packageId}/itinerary/reorder`, {
      method: "PUT",
      token,
      body: JSON.stringify({ days }),
    }),

  createBooking: (
    token: string,
    payload: {
      package_id: number;
      travel_date: string;
      travelers_count: number;
      traveler_details?: Record<string, unknown>;
      special_requests?: string;
    },
  ) =>
    api<{ data: TourBooking }>("/tours/bookings", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),

  getBookings: (token: string) => api<Paginated<TourBooking>>("/tours/bookings", { token }),

  getAdminBookings: (token: string, params?: { status?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.page) query.set("page", String(params.page));
    const qs = query.toString();
    return api<Paginated<TourBooking>>(`/tours/admin/bookings${qs ? `?${qs}` : ""}`, { token });
  },

  updateAdminBooking: (
    token: string,
    id: number,
    payload: Partial<{ status: string; payment_status: string; payment_reference: string }>,
  ) =>
    api<{ data: TourBooking }>(`/tours/admin/bookings/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    }),

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
  getPaymentsSettings: (token: string) =>
    api<{ data: PaymentsSettingsPayload | null }>("/admin/settings/payments", { token }),
  updatePaymentsSettings: (token: string, value: PaymentsSettingsPayload) =>
    api<{ data: PaymentsSettingsPayload }>("/admin/settings/payments", {
      method: "PUT",
      token,
      body: JSON.stringify({ value }),
    }),
  getPermissionSections: (token: string) =>
    api<{ data: PermissionSection[] }>("/admin/permissions", { token }),
  getManagedRoles: (token: string) =>
    api<{ data: AdminRoleRecord[] }>("/admin/roles/manage", { token }),
  createManagedRole: (token: string, payload: { name: string; permissions: string[] }) =>
    api<{ data: AdminRoleRecord }>("/admin/roles/manage", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),
  updateManagedRole: (token: string, roleId: number, payload: { name?: string; permissions?: string[] }) =>
    api<{ data: AdminRoleRecord }>(`/admin/roles/manage/${roleId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    }),
  deleteManagedRole: (token: string, roleId: number) =>
    api<{ message: string }>(`/admin/roles/manage/${roleId}`, { method: "DELETE", token }),

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
  duplicatePage: (token: string, id: number, payload?: { title?: string }) =>
    api<{ data: CmsPage }>(`/cms/admin/pages/${id}/duplicate`, {
      method: "POST",
      token,
      body: JSON.stringify(payload ?? {}),
    }),
  createPageSection: (token: string, pageId: number, payload: SectionPayload) =>
    api<{ data: PageSection }>(`/cms/admin/pages/${pageId}/sections`, { method: "POST", token, body: JSON.stringify(payload) }),
  updatePageSection: (token: string, pageId: number, sectionId: number, payload: Partial<SectionPayload>) =>
    api<{ data: PageSection }>(`/cms/admin/pages/${pageId}/sections/${sectionId}`, { method: "PUT", token, body: JSON.stringify(payload) }),
  deletePageSection: (token: string, pageId: number, sectionId: number) =>
    api<{ message: string }>(`/cms/admin/pages/${pageId}/sections/${sectionId}`, { method: "DELETE", token }),
  duplicatePageSection: (token: string, pageId: number, sectionId: number) =>
    api<{ data: PageSection }>(`/cms/admin/pages/${pageId}/sections/${sectionId}/duplicate`, {
      method: "POST",
      token,
    }),
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

  validateCoupon: (payload: { code: string; subtotal: number }) =>
    api<{ data: { code: string; type: string; value: string; discount: number } }>("/shop/coupons/validate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getAdminCoupons: (token: string) => api<Paginated<ShopCoupon>>("/shop/admin/coupons", { token }),
  createCoupon: (token: string, payload: ShopCouponPayload) =>
    api<{ data: ShopCoupon }>("/shop/admin/coupons", { method: "POST", token, body: JSON.stringify(payload) }),
  updateCoupon: (token: string, id: number, payload: Partial<ShopCouponPayload>) =>
    api<{ data: ShopCoupon }>(`/shop/admin/coupons/${id}`, { method: "PUT", token, body: JSON.stringify(payload) }),
  deleteCoupon: (token: string, id: number) =>
    api<{ message: string }>(`/shop/admin/coupons/${id}`, { method: "DELETE", token }),

  getAdminInventory: (token: string, params?: { low_stock_threshold?: number }) => {
    const query = new URLSearchParams();
    if (params?.low_stock_threshold) query.set("low_stock_threshold", String(params.low_stock_threshold));
    const qs = query.toString();
    return api<{ data: InventorySnapshot }>(`/shop/admin/inventory${qs ? `?${qs}` : ""}`, { token });
  },
  adjustProductStock: (token: string, productId: number, stock: number) =>
    api<{ data: Product }>(`/shop/admin/inventory/products/${productId}/stock`, {
      method: "PUT",
      token,
      body: JSON.stringify({ stock }),
    }),

  getAdminEnquiries: (token: string, params?: { status?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    const qs = query.toString();
    return api<Paginated<TourEnquiry>>(`/tours/admin/enquiries${qs ? `?${qs}` : ""}`, { token });
  },
  updateAdminEnquiry: (token: string, id: number, payload: Partial<{ status: string; assigned_to: number | null }>) =>
    api<{ data: TourEnquiry }>(`/tours/admin/enquiries/${id}`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    }),
  createTourEnquiry: (payload: TourEnquiryPayload) =>
    api<{ data: TourEnquiry; message: string }>("/tours/enquiries", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getAdminAttendance: (token: string, params?: { date?: string; course_id?: number }) => {
    const query = new URLSearchParams();
    if (params?.date) query.set("date", params.date);
    if (params?.course_id) query.set("course_id", String(params.course_id));
    const qs = query.toString();
    return api<Paginated<AttendanceRecord>>(`/academy/admin/attendance${qs ? `?${qs}` : ""}`, { token });
  },
  markAttendance: (
    token: string,
    payload: { enrollment_id: number; date: string; status: string; method?: string },
  ) =>
    api<{ data: AttendanceRecord }>("/academy/admin/attendance", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),
  getAttendanceEnrollments: (token: string, params?: { course_id?: number; batch_id?: number }) => {
    const query = new URLSearchParams();
    if (params?.course_id) query.set("course_id", String(params.course_id));
    if (params?.batch_id) query.set("batch_id", String(params.batch_id));
    const qs = query.toString();
    return api<Paginated<Enrollment>>(`/academy/admin/attendance/enrollments${qs ? `?${qs}` : ""}`, { token });
  },

  getAdminCertificates: (token: string) =>
    api<Paginated<AcademyCertificate>>("/academy/admin/certificates", { token }),
  issueCertificate: (token: string, payload: { enrollment_id: number; file_path?: string }) =>
    api<{ data: AcademyCertificate }>("/academy/admin/certificates", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),
  uploadCertificateFile: async (token: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    const url = `${getApiUrl()}/academy/admin/certificates/upload`;
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
    return response.json() as Promise<{ data: { url: string; path: string } }>;
  },
  updateCertificateFile: (token: string, certificateId: number, file_path: string) =>
    api<{ data: AcademyCertificate }>(`/academy/admin/certificates/${certificateId}`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ file_path }),
    }),
  getMyCertificates: (token: string) =>
    api<{ data: AcademyCertificate[] }>("/academy/certificates", { token }),

  createPaymentOrder: (
    token: string,
    payload: { payable_type: "shop_order" | "tour_booking" | "academy_enrollment"; payable_id: number },
  ) =>
    api<{
      data: {
        configured: boolean;
        amount: number;
        receipt: string;
        razorpay: { order_id: string; amount: number; currency: string; key: string } | null;
      };
    }>("/payments/razorpay/order", { method: "POST", token, body: JSON.stringify(payload) }),

  verifyPayment: (
    token: string,
    payload: {
      payable_type: "shop_order" | "tour_booking" | "academy_enrollment";
      payable_id: number;
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
  ) =>
    api<{ message: string }>("/payments/razorpay/verify", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
    }),

  getNotifications: (token: string) =>
    api<{ data: AppNotification[] }>("/notifications", { token }),
  markNotificationRead: (token: string, id: string) =>
    api<{ message: string }>(`/notifications/${id}/read`, { method: "POST", token }),
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
  evoke_id?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  age?: number | null;
  blood_group?: string | null;
  learning_mode?: "offline" | "online" | null;
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
  gender?: string;
  date_of_birth?: string;
  age?: number;
  blood_group?: string;
  learning_mode?: "offline" | "online";
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

export interface DashboardCelebration {
  id: number;
  name: string;
  type: "birthday" | "anniversary";
  date: string;
  age?: number;
  years?: number;
  avatar_url?: string | null;
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
  celebrations?: {
    birthdays: DashboardCelebration[];
    anniversaries: DashboardCelebration[];
  };
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
  status: "upcoming" | "open" | "active" | "completed" | "cancelled";
  capacity?: number;
  trainer_id?: number | null;
  trainer?: { name: string } | null;
}

export interface CourseBatchPayload {
  name: string;
  start_date: string;
  end_date?: string;
  capacity?: number;
  status?: CourseBatch["status"];
  trainer_id?: number | null;
}

export interface Trainer {
  id: number;
  name: string;
  slug: string;
  bio?: string | null;
  photo?: string | null;
  specializations?: string[] | null;
  certifications?: string[] | null;
  is_active: boolean;
  branch_id?: number | null;
}

export interface TrainerPayload {
  name: string;
  bio?: string;
  photo?: string;
  specializations?: string[];
  certifications?: string[];
  branch_id?: number | null;
  is_active?: boolean;
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
  is_featured?: boolean;
  related_slugs?: string[] | null;
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
  amount_paid?: string;
  enrolled_at?: string | null;
  created_at?: string;
  user?: User;
  batch?: {
    name?: string;
    course?: { title: string; slug?: string };
    trainer?: { name: string } | null;
  };
}

export interface CartItem {
  id: number;
  quantity: number;
  product?: Product;
  variant?: ProductVariant | null;
}

export interface Cart {
  id: number;
  items: CartItem[];
}

export interface ShopOrder {
  id: number;
  order_number: string;
  status: string;
  payment_status?: string;
  payment_reference?: string | null;
  subtotal?: string;
  discount?: string;
  shipping?: string;
  total: string;
  total_amount?: string;
  tracking_number?: string | null;
  shipping_address?: Record<string, string> | null;
  billing_address?: Record<string, string> | null;
  created_at: string;
  user?: User;
  items?: Array<{
    id?: number;
    product_name: string;
    quantity: number;
    unit_price?: string;
    total: string;
  }>;
}

export interface TourBooking {
  id: number;
  booking_number: string;
  status: string;
  payment_status?: string;
  total_amount: string;
  travel_date: string;
  travelers_count: number;
  package?: { title: string; slug: string };
  user?: User;
  created_at: string;
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

export interface ShopCatalogListParams extends CatalogListParams {
  q?: string;
  sort?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  on_sale?: boolean;
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

function shopCatalogQuery(params?: ShopCatalogListParams): string {
  if (!params) return "";
  const query = new URLSearchParams();
  if (params.q?.trim()) query.set("q", params.q.trim());
  if (params.category) query.set("category", params.category);
  if (params.sort) query.set("sort", params.sort);
  if (params.min_price != null && params.min_price > 0) {
    query.set("min_price", String(params.min_price));
  }
  if (params.max_price != null && params.max_price > 0) {
    query.set("max_price", String(params.max_price));
  }
  if (params.in_stock) query.set("in_stock", "1");
  if (params.on_sale) query.set("on_sale", "1");
  if (params.featured) query.set("featured", "1");
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
  related_slugs?: string[] | null;
  category_id: number;
  category?: ShopCategory;
  variants?: ProductVariant[];
  seo_title?: string | null;
  seo_description?: string | null;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  name: string;
  price: string;
  stock: number;
  options?: Record<string, string> | null;
}

export interface ProductVariantPayload {
  sku: string;
  name: string;
  price: number;
  stock: number;
  options?: Record<string, string>;
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
  available_from?: string | null;
  available_until?: string | null;
  price: string;
  description: string | null;
  gallery?: string[] | null;
  inclusions?: string[] | null;
  exclusions?: string[] | null;
  is_active: boolean;
  is_featured: boolean;
  related_slugs?: string[] | null;
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
  available_from?: string;
  available_until?: string;
  price: number;
  gallery?: string[];
  inclusions?: string[];
  exclusions?: string[];
  seo_title?: string;
  seo_description?: string;
}

export interface ItineraryDay {
  id: number;
  package_id: number;
  day_number: number;
  title: string;
  description: string | null;
  description_format?: import("@/lib/text-format").TextFormat | null;
  activities: string[] | null;
  accommodation: string | null;
  meals: string[] | null;
}

export interface ItineraryPayload {
  day_number: number;
  title: string;
  description?: string;
  description_format?: import("@/lib/text-format").TextFormat;
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
  gender?: string | null;
  date_of_birth?: string | null;
  blood_group?: string | null;
  learning_mode?: "offline" | "online" | null;
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
    headerText?: string;
    headerSubheading?: string;
    headerFont?: "jakarta" | "geist-sans" | "geist-mono";
  };
  header?: Partial<import("@/lib/header-config").BrandHeaderConfig>;
}

export interface PaymentsSettingsPayload {
  razorpay_enabled: boolean;
  payment_link_url?: string | null;
  payment_link_label?: string;
  contact_email?: string;
  contact_whatsapp?: string;
}

export interface PermissionSection {
  section: string;
  permissions: { id: number; name: string }[];
}

export interface AdminRoleRecord {
  id: number;
  name: string;
  permissions: string[];
  users_count?: number;
  is_system?: boolean;
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
  gender?: string;
  date_of_birth?: string;
  blood_group?: string;
  learning_mode?: "offline" | "online";
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
  { value: "hero", label: "Hero" },
  { value: "banner", label: "Banner" },
  { value: "buttons", label: "Button row" },
  { value: "tabs", label: "Tabs" },
  { value: "table", label: "Table" },
  { value: "text", label: "Text" },
  { value: "gallery", label: "Gallery" },
  { value: "faq", label: "FAQ" },
  { value: "video", label: "Video" },
  { value: "cards", label: "Cards" },
  { value: "stats", label: "Quick facts" },
  { value: "inclusions", label: "Inclusions & Exclusions" },
  { value: "itinerary", label: "Timeline" },
  { value: "catalog", label: "Live catalog" },
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

/** First navigable admin path for users without dashboard access. */
export function getDefaultAdminPath(navigation: NavItem[]): string {
  for (const item of navigation) {
    if (item.href) return item.href;
    const childHref = item.children?.find((child) => child.href)?.href;
    if (childHref) return childHref;
  }
  return "/admin";
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

export interface ShopCoupon {
  id: number;
  code: string;
  type: "percentage" | "fixed";
  value: string;
  min_order_amount?: string | null;
  usage_limit?: number | null;
  used_count?: number;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active: boolean;
}

export interface ShopCouponPayload {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  min_order_amount?: number;
  usage_limit?: number;
  starts_at?: string;
  expires_at?: string;
  is_active?: boolean;
}

export interface InventorySnapshot {
  products: Paginated<Product>;
  low_stock_variants: ProductVariant[];
  threshold: number;
}

export interface TourEnquiry {
  id: number;
  package_id?: number | null;
  name: string;
  email: string;
  phone?: string | null;
  travelers_count?: number | null;
  preferred_date?: string | null;
  message?: string | null;
  status: string;
  package?: { title: string };
  created_at: string;
}

export interface TourEnquiryPayload {
  package_id?: number;
  name: string;
  email: string;
  phone?: string;
  travelers_count?: number;
  preferred_date?: string;
  message?: string;
}

export interface AttendanceRecord {
  id: number;
  enrollment_id: number;
  date: string;
  status: string;
  method: string;
  enrollment?: Enrollment;
}

export interface AcademyCertificate {
  id: number;
  enrollment_id: number;
  certificate_number: string;
  file_path?: string | null;
  issued_at: string;
  enrollment?: Enrollment;
}

export interface AppNotification {
  id: string;
  type: string;
  data: Record<string, unknown>;
  read_at?: string | null;
  created_at: string;
}
