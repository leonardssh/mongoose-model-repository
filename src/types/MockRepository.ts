import IRepository from './IRepository';
import { FilterQuery, UpdateQuery, Document } from 'mongoose';
import { UpdateResult, DeleteResult } from 'mongodb';
import { PaginatedResult, QueryOptions, UpdateOptions } from './others';
import Database from './Database';
import Collection from './Collection';
import Author, { IAuthor } from '../__test__/models/Author';
import Book, { IBook } from '../__test__/models/Book';

abstract class MockRepository<T extends Document> implements IRepository<T> {
  protected database:Database
  protected model: Collection<T>

  constructor(database: Database, modelName: string) {
    this.database = database;
    this.model = database.getCollection(modelName)
  }
  
  async create(data: T | T[]): Promise<void | T | T[]> {
    this.model.create(data)
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
  findOneAndUpdate(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: UpdateOptions): Promise<T | null> {
    throw new Error('Method not implemented.');
  }
  findByIdAndUpdate(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: UpdateOptions): Promise<T | null> {
    throw new Error('Method not implemented.');
  }
  findAndPaginate(filter: FilterQuery<T>, page: number, limit: number, sort: any): Promise<PaginatedResult<T>> {
    throw new Error('Method not implemented.');
  }
}

export default MockRepository;


// const creatAuthor = <IAuthor>(MyModel: new(doc: any)=> IAuthor)=>{
//   const obj = new MyModel({
//     name: 'Osemudmane itua',
//     age: 44
//   })
//   console.log(obj)
// }

// creatAuthor(Author)

// const database = new Database([
//   {
//     name: 'Author',
//     model: Author,
//     CustomModel: Author
//   },
//   {
//     name: 'Book',
//     model: Book,
//     CustomModel: Book
//   }
// ])

// class MockAuthorRepository extends MockRepository<IAuthor>{
//   constructor(database: Database)
//   {
//     super(database,'Author')
//   }
// }

// const mockAuthorRepository = new MockAuthorRepository(database)

// mockAuthorRepository.create({
//   name: 'Osemudiamen Itua',
//   age: 45
// } as IAuthor)
