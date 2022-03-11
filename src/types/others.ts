export interface QueryOptions {
  sort?: any;
  select?: string;
  lean?: boolean;
  populate?: string | string[];
  skip?: number;
  limit?: number;
}
