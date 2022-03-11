export interface QueryOptions {
  sort?: any;
  select?: string;
  lean?: boolean;
  populate?: string | string[];
  skip?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  totalDocuments: number;
  totalPages: number;
  currentPage: number;
  nextPage: number | null;
  prevPage: number | null;
  data: T[];
}
