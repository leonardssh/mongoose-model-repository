
export interface QueryOptions {
  sort?: any;
  select?: string;
  lean?: boolean;
  populate?: string | string[];
}

export interface QueryOptionsExtended extends QueryOptions {
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

export interface UpdateOptions {
  upsert?: boolean;
  lean?: boolean;
  returnDocument?: 'before' | 'after';
  overwrite?: boolean;
}
