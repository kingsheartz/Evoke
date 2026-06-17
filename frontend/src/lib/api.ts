const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
    next: { revalidate: 60 },
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
    api<{ data: SearchResult[] }>(`/search?q=${encodeURIComponent(q)}${module ? `&module=${module}` : ""}`),
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
