import { FilterQuery, UpdateQuery } from 'mongoose';
import { UpdateResult, DeleteResult } from 'mongodb';
import { QueryOptions, PaginatedResult, UpdateOptions, QueryOptionsExtended } from './others';

interface IRepository<T> {
  //create
  create(data: T | T[]): Promise<T | void | T[]>;

  //query
  findById(id: string, options?: QueryOptions): Promise<T | null>;
  findOne(filter: FilterQuery<T>, options?: QueryOptions): Promise<T | null>;
  find(filter: FilterQuery<T>, options?: QueryOptionsExtended): Promise<T[]>;
  countDocuments(filter: FilterQuery<T>): Promise<number>;

  //Pagination
  findAndPaginate(
    filter: FilterQuery<T>,
    page: number,
    limit: number,
    options?: QueryOptions
  ): Promise<PaginatedResult<T>>;

  //deletion
  findByIdAndDelete(id: string): Promise<T | null>;
  findOneAndDelete(filter: FilterQuery<T>): Promise<T | null>;
  deleteOne(filter: FilterQuery<T>): Promise<DeleteResult>;
  deleteMany(filter: FilterQuery<T>): Promise<DeleteResult>;

  //update
  updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<UpdateResult>;
  updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<UpdateResult>;
  findOneAndUpdate(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: UpdateOptions): Promise<T | null>;
  findByIdAndUpdate(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: UpdateOptions): Promise<T | null>;
}

export default IRepository;
