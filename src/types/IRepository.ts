import { FilterQuery, UpdateQuery } from 'mongoose';
import { QueryOptions } from './others';

interface IRepository<T> {
  create(data: T | T[]): Promise<T | void | T[]>;
  findById(id: string, options?:QueryOptions): Promise<T | null>;
  findOne(filter: FilterQuery<T>, option?:QueryOptions): Promise<T | null>;
  findByIdAndDelete(id: string): Promise<void>;
  deleteOne(filter: FilterQuery<T>): Promise<void>;
  deleteMany()
  findAndUpdate(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<void>;
  find(filter: FilterQuery<T>, select?: string, sort?: any, options?: { lean?: boolean }): Promise<T[]>;
}

export default IRepository;
