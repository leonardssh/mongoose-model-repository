import IRepository from './IRepository';
import { FilterQuery, UpdateQuery, Model, Query } from 'mongoose';
import { DeleteResult, UpdateResult } from 'mongodb';
import { QueryOptions, PaginatedResult, UpdateOptions, QueryOptionsExtended } from './others';

abstract class Repository<T> implements IRepository<T> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: T | T[]): Promise<void | T | T[]> {
    const doc = await this.model.create(data);
    return doc;
  }
  async findById(id: string, options?: QueryOptions): Promise<T | null> {
    let query = this.model.findById(id);
    const { select, lean } = options as QueryOptions;
    if (select) query = query.select(select);

    if (options) {
      const { select, lean, sort, populate } = options;
      if (select) query = query.select(select);
      if (sort) query = query.sort(sort);
      if (typeof populate === 'string') query = query.populate(populate) as any;
      if (typeof populate === 'object') {
        for (const item of populate) query = query.populate(item) as any;
      }
      if (lean) query = query.lean();
    }
    const data = await query;

    return data;
  }
  async findOne(filter: FilterQuery<T>, options?: QueryOptions): Promise<T | null> {
    let query = this.model.findOne(filter);
    const { select, lean } = options as QueryOptions;
    if (select) query = query.select(select);

    if (options) {
      const { select, lean, sort, populate } = options;
      if (select) query = query.select(select);
      if (sort) query = query.sort(sort);
      if (typeof populate === 'string') query = query.populate(populate) as any;
      if (typeof populate === 'object') {
        for (const item of populate) query = query.populate(item) as any;
      }
      if (lean) query = query.lean();
    }
    const data = await query;

    return data;
  }
  async find(filter: FilterQuery<T>, options?: QueryOptionsExtended): Promise<T[]> {
    let query = this.model.find(filter);

    if (options) {
      const { select, lean, sort, populate, skip, limit } = options as QueryOptionsExtended;
      if (select) query = query.select(select);
      if (sort) query = query.sort(sort);
      if (typeof populate === 'string') query = query.populate(populate);
      if (typeof populate === 'object') {
        for (const item of populate) query = query.populate(item);
      }
      if (skip) query = query.skip(skip);
      if (limit) query = query.limit(limit);
      if (lean) query = query.lean();
    }
    const data = await query;

    return data;
  }
  async countDocuments(filter: FilterQuery<T>): Promise<number> {
    let query = this.model.find(filter).countDocuments();
    const data = await query;
    return data;
  }

  async findAndPaginate(
    filter: FilterQuery<T>,
    page: number,
    limit: number,
    options?: QueryOptions
  ): Promise<PaginatedResult<T>> {
    const totalDocuments = await this.model.countDocuments(filter);
    const totalPages = Math.ceil(totalDocuments / limit);
    const currentPage = page;
    const nextPage = page + 1 <= totalPages ? page + 1 : null;
    const prevPage = page - 1 > 0 ? page - 1 : null;

    let query = this.model.find(filter);

    if (options) {
      const { select, lean, sort, populate } = options;
      if (select) query = query.select(select);
      if (sort) query = query.sort(sort);
      if (typeof populate === 'string') query = query.populate(populate);
      if (typeof populate === 'object') {
        for (const item of populate) query = query.populate(item);
      }
      if (lean) query = query.lean();
    }

    const data = await query.skip((page - 1) * limit).limit(limit);

    return {
      totalDocuments,
      totalPages,
      currentPage,
      nextPage,
      prevPage,
      data,
    };
  }

  async findByIdAndDelete(id: string): Promise<T | null> {
    const doc = await this.model.findByIdAndDelete(id);
    return doc;
  }

  async findOneAndDelete(filter: FilterQuery<T>): Promise<T | null> {
    const doc = await this.model.findOneAndDelete(filter);
    return doc;
  }

  async deleteOne(filter: FilterQuery<T>): Promise<DeleteResult> {
    const result = await this.model.deleteOne(filter);
    return result;
  }
  async deleteMany(filter: FilterQuery<T>): Promise<DeleteResult> {
    const result = await this.model.deleteMany(filter);
    return result;
  }
  async updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<UpdateResult> {
    const result = await this.model.updateMany(filter, update);
    return result;
  }
  async updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<UpdateResult> {
    const result = await this.model.updateOne(filter, update);
    return result;
  }
  async findOneAndUpdate(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: UpdateOptions): Promise<T | null> {
    const result = await this.model.findOneAndUpdate(filter, update, options);
    return result;
  }
  async findByIdAndUpdate(id: string, update: UpdateQuery<T>, options?: UpdateOptions): Promise<T | null> {
    const result = await this.model.findByIdAndUpdate(id,update,options);
    return result;
  }
}

export default Repository;
