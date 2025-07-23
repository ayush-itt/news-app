export interface ICategoryResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface ICategoryCreateResponse {
  message: string;
  category: ICategoryResponse;
}

export interface ICategoryUpdateResponse {
  message: string;
  category: ICategoryResponse;
}

export interface ICategoryDeleteResponse {
  message: string;
}

export interface ICategoryToggleResponse {
  message: string;
  category: ICategoryResponse;
}

export interface ICategoryPaginatedResponse {
  categories: ICategoryResponse[];
  total: number;
  page: number;
  limit: number;
}
