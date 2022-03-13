import {Model, QueryOptions, FilterQuery, Document, SchemaDefinitionType} from 'mongoose'

class Collection<T extends Document> {
    protected name: string
    protected model: Model<T>
    protected MyModel: new(doc: any)=> any
    protected documents: T[] = []
    protected idMap: Map<string,T> = new Map()
    protected documentMiddlewares: ((doc: T)=>T)[] = [] //array of document middleware in the order it shold be processed
    protected queryMiddleware: ((query: FilterQuery<T>)=>FilterQuery<T>)[] = []// query middleare in order

    constructor(name:string, model: Model<T>, MyModel: new(doc: T)=> T)
    {
        this.name = name;
        this.model = model
        this.MyModel = MyModel
    }


    addDefaults(doc:T): T
    {
        /**
         * Gets details from the mongoose schema to konw fields that have default values and sets the values
         */
        const schemaDesc = this.model.schema.obj
        for(const field in schemaDesc)
        {
            if((schemaDesc[field] as any)['default'])   
            {
                if(!(doc as any)[field])
                {
                    (doc as any)[field] = (schemaDesc[field] as any)['default']
                }
            }
        }
        return doc
    }

    addDocumentMiddleware(type: string, middleware: (doc:T)=>T)
    {
        /**
         * Should receive a middleware function from the user
         */
        throw new Error('Not implemented yer')
    }

    addQueryMiddleware(type: string, middleware: (query: FilterQuery<T>)=>FilterQuery<T>)
    {
        /**
         * Should receive a middleware function from the user
         */
        throw new Error('Not implemented yer')
    }

    
    addTimestamps(doc:T) : T{
        /**
         * Fpr documents where createdat and updatedAt are specified, it adds these fields to the documents. 
         */
        const schemaDesc = this.model.schema.paths
        for(const field in schemaDesc)
        {
            if(field==='createdAt' || field==='updatedAt')
            {
                (doc as any)[field] = new Date()
            }
        }
        return doc
    }


    validateBeforeSave(doc: T)
    {
        /**
         * It should validate all fields in an document based on the imput schena.
         */
        const vbs = (this.model.schema as any)['options']['validateBeforeSave']
        if(vbs===true)
        {
            return doc
        }
        return doc
    }

    //adds defaults and applies presave middlware.
    createDoc(data: T | T[]): T | T[]
    {
        const result = new this.MyModel(data)
        if(Array.isArray(result))
        {
            const updatedResult:T[] = []
            for(const doc of result)
            {
                let newDoc
                newDoc = this.addDefaults(doc)
                newDoc = this.addTimestamps(newDoc)
                updatedResult.push(newDoc)
            }
            return updatedResult
        }
        let newDoc = this.addDefaults(result)
        newDoc = this.addTimestamps(newDoc)
        return newDoc
    }
    
    //checks that a documents matched the given filter.
    checkMatch(filter: FilterQuery<T>, doc: T): boolean {
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

    create(data: T | T[])
    {
        const result = this.createDoc(data)
        if(Array.isArray(result))
        {
            this.documents = this.documents.concat(result)
            for(const doc of result)
            {
                this.idMap.set(doc._id.toString(),doc)
            }
        }
        else
        {
            this.documents.push(result)
            this.idMap.set(result._id.toString(),result)
        }
    }

    async findById(id: string, options?: QueryOptions): Promise<T | null> {
        const doc = this.idMap.get(id) || null
        if(!doc) return null
        return doc
    }
}

export default Collection