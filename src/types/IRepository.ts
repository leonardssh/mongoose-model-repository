import { FilterQuery, UpdateQuery } from 'mongoose';

interface IRepository<T> {
  create(data: T | T[]): Promise<T | void | T[]>;
  findById(id: string, select?: string, options?: { lean: boolean }): Promise<T | null>;
  findByIdAndDelete(id: string): Promise<void>;
  findAndDelete(filter: FilterQuery<T>): Promise<void>;
  findOne(filter: FilterQuery<T>, select?: string, options?: { lean?: boolean }): Promise<T | null>;
  findAndUpdate(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<void>;
  find(filter: FilterQuery<T>, select?: string, sort?: any, options?: { lean?: boolean }): Promise<T[]>;
}

export default IRepository;
