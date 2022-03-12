import {Model} from 'mongoose'

class Collection<T> {
    name: string
    model: Model<T>
    MyModel: new(doc: any)=> any
    documents: T[] = []

    constructor(name:string, model: Model<T>, MyModel: new(doc: T)=> T)
    {
        this.name = name;
        this.model = model
        this.MyModel = MyModel
    }

    createDoc(data: T | T[]): T | T[]
    {
        const result = new this.MyModel(data)
        return result
    }

    insertDocuments(data: T | T[])
    {
        const result = this.createDoc(data)
        if(Array.isArray(result))
        {
            this.documents = this.documents.concat(result)
        }
        else
        {
            this.documents.push(result)
        }
    }
}

export default Collection