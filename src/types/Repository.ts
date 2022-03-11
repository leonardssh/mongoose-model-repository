import IRepository from './IRepository';
import { FilterQuery, UpdateQuery, Model } from 'mongoose';
import { DeleteResult, UpdateResult } from 'mongodb';
import { QueryOptions } from './others';

abstract class Repository<T> implements IRepository<T> {
  model: Model<T>;
  constructor(model: Model<T>) {
    this.model = model;
  }
  create(data: T | T[]): Promise<void | T | T[]> {
    throw new Error('Method not implemented.');
  }
  findById(id: string, options?: QueryOptions): Promise<T | null> {
    throw new Error('Method not implemented.');
  }
  findOne(filter: FilterQuery<T>, option?: QueryOptions): Promise<T | null> {
    throw new Error('Method not implemented.');
  }
  find(filter: FilterQuery<T>, options?: QueryOptions): Promise<T[]> {
    throw new Error('Method not implemented.');
  }
  countDocuments(filter: FilterQuery<T>): Promise<number> {
    throw new Error('Method not implemented.');
  }
  findByIdAndDelete(id: string): Promise<T | null> {
    throw new Error('Method not implemented.');
  }
  findOneAndDelete(filter: FilterQuery<T>): Promise<T | null> {
    throw new Error('Method not implemented.');
  }
  deleteOne(filter: FilterQuery<T>): Promise<DeleteResult> {
    throw new Error('Method not implemented.');
  }
  deleteMany(filter: FilterQuery<T>): Promise<DeleteResult> {
    throw new Error('Method not implemented.');
  }
  updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<UpdateResult> {
    throw new Error('Method not implemented.');
  }
  updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<UpdateResult> {
    throw new Error('Method not implemented.');
  }
  findOneAndUpdate(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null> {
    throw new Error('Method not implemented.');
  }
  findByIdAndUpdate(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<T | null> {
    throw new Error('Method not implemented.');
  }
}

export default Repository;
