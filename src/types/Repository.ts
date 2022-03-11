// import IRepository from './IRepository';
// import { FilterQuery, UpdateQuery, Model } from 'mongoose';

// class Repository<T> implements IRepository<T> {
//   model: Model<T>;
//   constructor(model: Model<T>) {
//     this.model = model;
//   }

//   async create(data: T | T[]): Promise<void | T | T[]> {
//     const result = await this.model.create(data);
//     return result;
//   }

//   async findById(id: string, select?: string, options?: { lean: boolean }): Promise<T | null> {
//     let query = this.model.findById(id);
//     if (select) query = query.select(select);

//     if (options) {
//       const { lean } = options;
//       if (lean) query = query.lean();
//     }
//     const data = await query;

//     return data;
//   }

//   async findByIdAndDelete(id: string): Promise<void> {
//     throw new Error('Method not implemented.');
//   }

//   async findAndDelete(filter: FilterQuery<T>): Promise<void> {
//     throw new Error('Method not implemented.');
//   }

//   async findOne(filter: FilterQuery<T>, select?: string, options?: { lean?: boolean }): Promise<T | null> {
//     let query = this.model.findOne(filter);
//     if (select) query = query.select(select);

//     if (options) {
//       const { lean } = options;
//       if (lean) query = query.lean();
//     }
//     const data = await query;
//     return data;
//   }

//   async findAndUpdate(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<void> {
//     throw new Error('Method not implemented.');
//   }

//   async find(filter: FilterQuery<T>, select?: string, sort?: any, options?: { lean?: boolean }): Promise<T[]> {
//     let query = this.model.find(filter);
//     if (select) query = query.select(select);
//     if (sort) query = query.sort(sort);
//     if (options) {
//       const { lean } = options;
//       if (lean) query = query.lean();
//     }

//     const data = await query;
//     return data;
//   }
// }

// export default Repository;
