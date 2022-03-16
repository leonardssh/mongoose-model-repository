import IRepository from './IRepository';
import { FilterQuery, UpdateQuery, Document } from 'mongoose';
import { UpdateResult, DeleteResult, Timestamp } from 'mongodb';
import { PaginatedResult, QueryOptions, UpdateOptions, QueryOptionsExtended } from './others';
import { Database } from './Database';
import Collection from './Collection';
import Author, { IAuthor } from '../__test__/models/Author';
import Book, { IBook } from '../__test__/models/Book';

abstract class MockRepository<T extends Document> implements IRepository<T> {
  protected database: Database;
  protected model: Collection<T>;

  constructor(database: Database, modelName: string) {
    this.database = database;
    this.model = database.getCollection(modelName);
  }

  async create(data: T | T[]): Promise<void | T | T[]> {
    const doc = await this.model.create(data);
    return doc;
  }
  async findById(id: string, options?: QueryOptions): Promise<T | null> {
    const doc = this.model.findById(id, options);
    return doc;
  }
  async findOne(filter: FilterQuery<T>, options?: QueryOptions): Promise<T | null> {
    const doc = this.model.findOne(filter, options);
    return doc;
  }
  async find(filter: FilterQuery<T> = {}, options?: QueryOptionsExtended): Promise<T[]> {
    const result = this.model.find(filter, options);
    return result;
  }
  async countDocuments(filter: FilterQuery<T>): Promise<number> {
    const count = this.model.countDocuments(filter);
    return count;
  }
  async findByIdAndDelete(id: string): Promise<T | null> {
    const doc = await this.model.findByIdAndDelete(id);
    return doc;
  }
  async findOneAndDelete(filter: FilterQuery<T>): Promise<T | null> {
    const doc = this.model.findOneAndDelete(filter);
    return doc;
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
  async findOneAndUpdate(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: UpdateOptions): Promise<T | null> {
    const doc = this.model.findOneAndUpdate(filter, update, options);
    return doc;
  }
  async findByIdAndUpdate(id: string, update: UpdateQuery<T>, options?: UpdateOptions): Promise<T | null> {
    const doc = this.model.findByIdAndUpdate(id, update, options);
    return doc;
  }
  async findAndPaginate(
    filter: FilterQuery<T>,
    page: number,
    limit: number,
    options?: QueryOptions
  ): Promise<PaginatedResult<T>> {
    const allDocs = this.model.find(filter, { skip: limit * (page - 1), limit });
    const totalDocuments = await this.model.countDocuments(filter);
    const totalPages = Math.ceil(totalDocuments / limit);
    const currentPage = page;
    const nextPage = page + 1 <= totalPages ? page + 1 : null;
    const prevPage = page - 1 > 0 ? page - 1 : null;

    return {
      totalDocuments,
      totalPages,
      currentPage,
      nextPage,
      prevPage,
      data: allDocs,
    };
  }
}

export default MockRepository;
