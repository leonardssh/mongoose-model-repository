import { Model, FilterQuery, Document, UpdateQuery } from 'mongoose';
import { UpdateResult, DeleteResult } from 'mongodb';
import { UpdateOptions, QueryOptions } from './others';

class Collection<T extends Document> {
  protected name: string;
  protected model: Model<T>;
  protected MyModel: new (doc: any) => any;
  protected documents: T[] = [];
  protected idMap: Map<string, T> = new Map();
  protected deselectedFields: string[] = [];
  protected documentMiddlewares: ((doc: T) => T)[] = []; //array of document middleware in the order it shold be processed
  protected queryMiddleware: ((query: FilterQuery<T>) => FilterQuery<T>)[] = []; // query middleare in order

  constructor(name: string, model: Model<T>, MyModel: new (doc: T) => T) {
    this.name = name;
    this.model = model;
    this.MyModel = MyModel;
  }

  private addDefaults(doc: T): T {
    /**
     * Gets details from the mongoose schema to konw fields that have default values and sets the values
     */
    const schemaDesc = this.model.schema.obj;
    for (const field in schemaDesc) {
      if ((schemaDesc[field] as any)['default']) {
        if (!(doc as any)[field]) {
          (doc as any)[field] = (schemaDesc[field] as any)['default'];
        }
      }
    }
    return doc;
  }

  addDocumentMiddleware(type: string, middleware: (doc: T) => T) {
    /**
     * Should receive a middleware function from the user
     */
    throw new Error('Not implemented yer');
  }

  addQueryMiddleware(type: string, middleware: (query: FilterQuery<T>) => FilterQuery<T>) {
    /**
     * Should receive a middleware function from the user
     */
    throw new Error('Not implemented yer');
  }

  private addTimestamps(doc: T): T {
    /**
     * For documents where createdat and updatedAt are specified, it adds these fields to the documents.
     */
    const timeStampsDesc: any = (this.model.schema as any)['$timestamps'];
    if (timeStampsDesc) {
      let field: any = timeStampsDesc['createdAt'];
      (doc as any)[field] = new Date();
      field = timeStampsDesc['updatedAt'];
      (doc as any)[field] = new Date();
    }
    return doc;
  }

  private handleRequiredError(schemaDesc: any, field: string, doc: T): void {
    //Throws error when required field is not in the document.
    const reqDesc = (schemaDesc as any)[field]['required'];
    if (reqDesc) {
      let required = false;
      let message: string | null = null;
      if (Array.isArray(reqDesc) && reqDesc.length == 2) {
        required = reqDesc[0];
        message = reqDesc[1];
      } else {
        required = reqDesc;
      }

      //if the field is required and the field is not specified in doc
      if (required && !(doc as any)[field]) {
        if (!message) message = `${field} is required`;
        throw new Error(message);
      }
    }
  }

  private checkTypeError(schemaDesc: any, field: string, doc: T): void {
    //it should validate that all fields are of the right type
    const typeDesc = (schemaDesc as any)[field]['type'];
    if ((doc as any)[field]) {
      typeDesc((doc as any)[field]);
    }
  }

  private validateBeforeSave(doc: T) {
    /**
     * It should validate all fields in an document based on the imput schena.
     */
    const vbs = (this.model.schema as any)['options']['validateBeforeSave'];
    const schemaDesc = this.model.schema.obj;
    if (vbs === true) {
      for (const field in schemaDesc) {
        //check if the field is required and is specified
        this.handleRequiredError(schemaDesc, field, doc);

        //handle invalid type error
        this.checkTypeError(schemaDesc, field, doc);
      }
    }
    return doc;
  }

  private appplySelectFilter(doc: T, select: string) {
    /**
     * It should select only the required fields.
     */
    return doc;
  }

  //adds defaults and applies presave middlware.
  private createDoc(data: T | T[]): T | T[] {
    const result = new this.MyModel(data);
    if (Array.isArray(result)) {
      const updatedResult: T[] = [];
      for (const doc of result) {
        let newDoc;
        newDoc = this.addDefaults(doc);
        newDoc = this.addTimestamps(newDoc);
        updatedResult.push(newDoc);
      }
      return updatedResult;
    }
    let newDoc = this.addDefaults(result);
    newDoc = this.addTimestamps(newDoc);
    newDoc = this.validateBeforeSave(newDoc);
    return newDoc;
  }

  //checks that a documents matched the given filter.
  private checkMatch(filter: FilterQuery<T>, doc: T): boolean {
    let isMatch = true;
    for (const key in filter) {
      //queries like $in $lt
      if (typeof filter[key] === 'object') {
        for (const innerkey in filter[key]) {
          if (innerkey === '$lt') isMatch = isMatch && (doc as any)[key] < filter[key][innerkey];
          else if (innerkey === '$lte') isMatch = isMatch && (doc as any)[key] <= filter[key][innerkey];
          else if (innerkey === '$gt') isMatch = isMatch && (doc as any)[key] > filter[key][innerkey];
          else if (innerkey === '$gte') isMatch = isMatch && (doc as any)[key] >= filter[key][innerkey];
          else if (innerkey === '$in')
            isMatch = isMatch && (filter[key][innerkey] as any[]).includes((doc as any)[key]);
          else if (innerkey === '$regex')
            isMatch = isMatch && (filter[key][innerkey] as RegExp).test((doc as any)[key] as unknown as string);
        }
      } else if (key === '_id') return (doc as any)._id.toString() === filter._id.toString();
      else if (filter[key] !== (doc as any)[key]) {
        return false;
      }
      if (!isMatch) return false;
    }
    return isMatch;
  }

  create(data: T | T[]): T | T[] {
    const result = this.createDoc(data);
    if (Array.isArray(result)) {
      this.documents = this.documents.concat(result);
      for (const doc of result) {
        this.idMap.set(doc._id.toString(), doc);
      }
    } else {
      this.documents.push(result);
      this.idMap.set(result._id.toString(), result);
    }
    return result;
  }

  findById(id: string, options?: QueryOptions): T | null {
    const doc = this.idMap.get(id) || null;
    if (!doc) return null;
    return doc;
  }

  findOne(filter: FilterQuery<T>, options?: QueryOptions): T | null {
    if (Object.keys(filter).includes('_id')) return this.findById(filter._id.toString(), options);

    for (const doc of this.documents) {
      if (this.checkMatch(filter, doc)) return doc;
    }
    return null;
  }

  find(filter: FilterQuery<T> = {}, options?: QueryOptions): T[] {
    if (Object.keys(filter).includes('_id')) {
      const res: T[] = [];
      const doc = this.findById(filter._id.toString(), options);
      if (doc) res.push(doc);
      return res;
    }

    const res: T[] = [];
    for (const doc of this.documents) {
      if (this.checkMatch(filter, doc)) {
        res.push(doc);
      }
    }
    return res;
  }

  countDocuments(filter: FilterQuery<T>): number {
    if (Object.keys(filter).includes('_id')) {
      const res: T[] = [];
      const doc = this.findById(filter._id.toString());
      if (doc) res.push(doc);
      return res.length;
    }

    const res: T[] = [];
    for (const doc of this.documents) {
      if (this.checkMatch(filter, doc)) {
        res.push(doc);
      }
    }
    return res.length;
  }

  findByIdAndDelete(id: string): T | null {
    const doc = this.findById(id);
    if (!doc) return null;

    const n = this.documents.length;
    for (let i = 0; i < n; i++) {
      const document = this.documents[i];
      if (doc === document) {
        this.idMap.delete(id);
        this.documents.splice(i, 1);
        break;
      }
    }

    return doc;
  }

  findOneAndDelete(filter: FilterQuery<T>): T | null {
    const doc = this.findOne(filter);
    if (!doc) return null;
    const n = this.documents.length;
    for (let i = 0; i < n; i++) {
      const document = this.documents[i];
      if (doc === document) {
        this.idMap.delete(doc._id.toString());
        this.documents.splice(i, 1);
        break;
      }
    }
    return doc;
  }
  deleteOne(filter: FilterQuery<T>): Promise<DeleteResult> {
    throw new Error('Method not implemented.');
    // acknowledged: boolean;
    // deletedCount: number;
  }
  deleteMany(filter: FilterQuery<T>): Promise<DeleteResult> {
    throw new Error('Method not implemented.');
  }
  updateMany(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<UpdateResult> {
    //       /** Indicates whether this write result was acknowledged. If not, then all other members of this result will be undefined */
    // acknowledged: boolean;
    // /** The number of documents that matched the filter */
    // matchedCount: number;
    // /** The number of documents that were modified */
    // modifiedCount: number;
    // /** The number of documents that were upserted */
    // upsertedCount: number;
    // /** The identifier of the inserted document if an upsert took place */
    // upsertedId: ObjectId;
    throw new Error('Method not implemented.');
  }
  updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<UpdateResult> {
    throw new Error('Method not implemented.');
  }
  findOneAndUpdate(filter: FilterQuery<T>, update: UpdateQuery<T>, options?: UpdateOptions): T | null {
    const doc = this.findOne(filter);
    if (!doc) return null;
    const n = this.documents.length;
    let before: T | null = null;
    let after: T | null = null;
    for (let i = 0; i < n; i++) {
      const document = this.documents[i];
      if (doc === document) {
        before = { ...doc };
        for (const key in update) {
          if ((doc as any)[key] !== update[key]) {
            (this.documents[i] as any)[key] = update[key];
          }
        }
        after = this.documents[i];
        break;
      }
    }
    return doc;
  }

  findByIdAndUpdate(id: string, update: UpdateQuery<T>, options?: UpdateOptions): T | null {
    const doc = this.findById(id);
    if (!doc) return null;

    const n = this.documents.length;
    for (let i = 0; i < n; i++) {
      const document = this.documents[i];
      if (doc === document) {
        for (const key in update) {
          if ((doc as any)[key] !== update[key]) {
            (this.documents[i] as any)[key] = update[key];
          }
        }
      }
    }

    return doc;
  }
}

export default Collection;
