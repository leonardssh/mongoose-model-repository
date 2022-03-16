import { Model, FilterQuery, Document, UpdateQuery } from 'mongoose';
import { UpdateResult, DeleteResult } from 'mongodb';
import { UpdateOptions, QueryOptions, QueryOptionsExtended } from './others';

function copy(object:any)
{
  return JSON.parse(JSON.stringify(object))
}

class Collection<T extends Document> {
  protected name: string;
  protected model: Model<T>;
  protected MyModel: new (doc: any) => any;
  protected documents: T[] = [];
  protected idMap: Map<string, T> = new Map();
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

  // addDocumentMiddleware(type: string, middleware: (doc: T) => T) {
  //   /**
  //    * Should receive a middleware function from the user
  //    */
  //   throw new Error('Not implemented yer');
  // }

  // addQueryMiddleware(type: string, middleware: (query: FilterQuery<T>) => FilterQuery<T>) {
  //   /**
  //    * Should receive a middleware function from the user
  //    */
  //   throw new Error('Not implemented yer');
  // }

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


   private async validateBeforeSave(doc: T) {
    /**
     * It should validate all fields in an document based on the imput schena.
     */
    const vbs = (this.model.schema as any)['options']['validateBeforeSave'];
    if (vbs === true) {
       await doc.validate()
    }
    return doc;
  }

  private appplySelectFilter(doc: T, select?: string| undefined) {
    /**
     * It should select only the required fields.
     */
     const schemaDesc = this.model.schema.obj;

    if(select)
    {
      let fields1 = select.split(' ');
      let only = true;
      const toBeAdded:string[] = []
      const onlyFields:string[] = []
      const toBeRemoved:string[] =[]
      
      //get all fields to deternmine whethere we are returning only specific fields(only)
      //or if we are removing and adding certain fields 
      for(const field of fields1)
      {
        if(field.length>0)
        {
          if(field[0]==='+' || field[0]==='-'){
            only = false;
            if(field[0]==='+')toBeAdded.push(field.substring(1))
            else if(field[0]==='-')toBeRemoved.push(field.substring(1))
          } 
          else
          {
            onlyFields.push(field);
          }
        }
      }

      
      if(only)
      {
        //add only the requested fields to newDoc
        const newDoc:T = {_id: doc._id} as T
        for(const field of onlyFields)
        {
          (newDoc as any)[field] = (doc as any)[field]
        }
        return newDoc;
      }
      else
      {
        //add all fields and add the ones requested by the user and remocve those 
        const newDoc = copy(doc)
        //remove all which are specified as select:false
        for(const field in schemaDesc)
        {
          if((schemaDesc[field] as any).select && (schemaDesc[field] as any).select===false)
          {
            delete newDoc[field]
          }
        }

        //add all fields that should be added
        for(const field of toBeAdded)
        {
          if(!newDoc[field])
          {
            newDoc[field] = (doc as any)[field]
          }
        }

        //remove all fields to be removed
        for(const field of toBeRemoved)
        {
          if(newDoc[field])
          {
            delete newDoc[field]
          }
        }

        return newDoc;
      }
      
    }


    //if no select string is set just find the default select specified in the schema
    const newDoc = copy(doc)
    //remove all which are specified as false
    for(const field in schemaDesc)
    {
      if((schemaDesc[field] as any).select && (schemaDesc[field] as any).select===false)
      {
        delete newDoc[field]
      }
    }

    
    return newDoc;
  }

  // private async saveDoc(doc:T):Promise<T>{
  //   console.log('document to be saved = ',doc)
  //   if(!this.idMap.get(doc._id.toString()))
  //   {
  //     console.log('I actuallly entered inside here')
  //     const newDoc = await this.create(doc)
  //     return newDoc as T;
  //   }
  //   this.findByIdAndUpdate(doc._id.toString(),doc as unknown as UpdateQuery<T>)
  //   const d = this.findById(doc._id.toString());
  //   console.log('updated = ',d)
  //   return {...doc};
  // }

  //adds defaults and applies presave middlware.
  private async createDoc(data: T | T[]): Promise<T | T[]> {
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
    newDoc = await this.validateBeforeSave(newDoc);
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

  async create(data: T | T[]): Promise<T | T[]> {
    const result = await this.createDoc(data);
    if (Array.isArray(result)) {
      this.documents = this.documents.concat(result);
      for (const doc of result) {
        this.idMap.set(doc._id.toString(), doc);
      }
    } else {
      this.documents.push(result);
      this.idMap.set(result._id.toString(), result);
    }
    return copy(result);
  }

  findById(id: string, options?: QueryOptions): T | null {
    const doc = this.idMap.get(id) || null;
    if (!doc) return null;
    return copy(doc);
  }

  findOne(filter: FilterQuery<T>, options?: QueryOptions): T | null {
    if (Object.keys(filter).includes('_id')) return this.findById(filter._id.toString(), options);

    for (const doc of this.documents) {
      if (this.checkMatch(filter, doc)) return copy(doc);
    }
    return null;
  }

  find(filter: FilterQuery<T> = {}, options?: QueryOptionsExtended): T[] {
    if (Object.keys(filter).includes('_id')) {
      const res: T[] = [];
      const doc = this.findById(filter._id.toString(), options);
      if (doc) res.push(copy(doc));
      return res;
    }

    const res: T[] = [];
    for (const doc of this.documents) {
      if (this.checkMatch(filter, doc)) {
        res.push(copy(doc));
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
      if (doc._id.toString() === document._id.toString()) {
        this.idMap.delete(id);
        this.documents.splice(i, 1);
        break;
      }
    }

    return copy(doc);
  }

  findOneAndDelete(filter: FilterQuery<T>): T | null {
    const doc = this.findOne(filter);
    if (!doc) return null;
    const n = this.documents.length;
    for (let i = 0; i < n; i++) {
      const document = this.documents[i];
      if (doc._id.toString() === document._id.toString()) {
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
      if (doc._id.toString()=== document._id.toString()) {
        before = copy(doc);
        for (const key in update) {
          if ((doc as any)[key] !== update[key]) {
            (this.documents[i] as any)[key] = update[key];
          }
        }
        after = this.documents[i];
        break;
      }
    }
    return copy(doc);
  }

  findByIdAndUpdate(id: string, update: UpdateQuery<T>, options?: UpdateOptions): T | null {
    const doc = this.findById(id);
    console.log('found',doc)
    if (!doc) return null;

    const n = this.documents.length;
    for (let i = 0; i < n; i++) {
      const document = this.documents[i];
      if (doc._id.toString() === document._id.toString()) {
        for (const key in update) {
          if ((doc as any)[key] !== update[key]) {
            (this.documents[i] as any)[key] = update[key];
          }
        }
      }
    }

    return copy(doc);
  }
}

export default Collection;
