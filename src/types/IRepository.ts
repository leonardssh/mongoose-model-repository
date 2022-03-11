import { FilterQuery, UpdateQuery } from 'mongoose';
import {UpdateResult, DeleteResult} from 'mongodb'
import { QueryOptions } from './others';

interface IRepository<T> {
  //create
  create(data: T | T[]): Promise<T | void | T[]>;

  //query
  findById(id: string, options?:QueryOptions): Promise<T | null>;
  findOne(filter: FilterQuery<T>, option?:QueryOptions): Promise<T | null>;
  find(filter: FilterQuery<T>, options?:QueryOptions): Promise<T[]>;
  countDocuments(filter: FilterQuery<T>): Promise<number>

  //deletion
  findByIdAndDelete(id: string): Promise<T | null>;
  findOneAndDelete(filter: FilterQuery<T>):Promise<T | null>;
  deleteOne(filter: FilterQuery<T>): Promise<DeleteResult>;
  deleteMany(filter: FilterQuery<T>): Promise<DeleteResult>;

  //update
  updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<UpdateResult>;
  updateOne(filter: FilterQuery<T>,update: UpdateQuery<T>): Promise<UpdateResult>;
  findOneAndUpdate(filter: FilterQuery<T>,update: UpdateQuery<T>): Promise<T | null>;
  findByIdAndUpdate(filter: FilterQuery<T>,update: UpdateQuery<T>): Promise<T | null>;
}



export default IRepository;
