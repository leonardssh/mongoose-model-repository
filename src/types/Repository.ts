import IRepository from './IRepository';
import { FilterQuery, UpdateQuery, Model, Query } from 'mongoose';
import { DeleteResult, UpdateResult } from 'mongodb';
import { QueryOptions, PaginatedResult } from './others';

abstract class Repository<T> implements IRepository<T> {
  model: Model<T>;
  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: T | T[]): Promise<void | T | T[]> {
    const doc = await this.model.create(data);
    await this.model.findOne().populate('ahjkahbd')
    return doc;
  }
  async findById(id: string, options?: QueryOptions): Promise<T | null> {
    let query = this.model.findById(id)
    const{ select, lean } = options as QueryOptions
    if (select) query = query.select(select);

    if(options)
    {
      const{ select, lean, sort, populate } = options
      if (select) query = query.select(select);
      if(sort) query = query.sort(sort)
      if(typeof populate === "string") query = query.populate(populate) as any
      if(typeof populate === "object"){
        for(const item of populate) query = query.populate(item) as any
      }
      if (lean) query = query.lean();
    }
    const data = await query;

    return data;
  }
  async findOne(filter: FilterQuery<T>, options?: QueryOptions): Promise<T | null> {
    let query = this.model.findOne(filter);
    const{ select, lean } = options as QueryOptions
    if (select) query = query.select(select);

    if(options)
    {
      const{ select, lean, sort, populate } = options
      if (select) query = query.select(select);
      if(sort) query = query.sort(sort)
      if(typeof populate === "string") query = query.populate(populate) as any
      if(typeof populate === "object"){
        for(const item of populate) query = query.populate(item) as any
      }
      if (lean) query = query.lean();
    }
    const data = await query;

    return data;
  }
  async find(filter: FilterQuery<T>, options?: QueryOptions): Promise<T[]> {
    let query = this.model.find(filter);
    

    if (options) {
      const{ select, lean, sort, populate } = options as QueryOptions
      if (select) query = query.select(select);
      if(sort) query = query.sort(sort)
      if(typeof populate === "string") query = query.populate(populate)
      if(typeof populate === "object"){
        for(const item of populate) query = query.populate(item)
      }
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

    if(options)
    {
      const{ select, lean, sort, populate } = options
      if (select) query = query.select(select);
      if(sort) query = query.sort(sort)
      if(typeof populate === "string") query = query.populate(populate)
      if(typeof populate === "object"){
        for(const item of populate) query = query.populate(item)
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
