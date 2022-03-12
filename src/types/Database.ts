import Collection from "./Collection";
import { NameModelMap } from "./others";
import {Document, Model} from 'mongoose'

class Database{
    private collections: Map<string,Collection<any>> = new Map

    constructor( modelData : NameModelMap<any> | NameModelMap<any>[] = []){
       this.registerModels(modelData)
    }

    registerModels(modelData : NameModelMap<any> | NameModelMap<any>[]): boolean
    {
        if(Array.isArray(modelData))
        {
            for(const data of modelData)
            {
                this.collections.set(data.name, new Collection<any>(data.name, data.model,data.CustomModel))
            }
        }
        else{
            this.collections.set(modelData.name,new Collection<any>(modelData.name,modelData.model,modelData.CustomModel))
        }
        return true
    }

    getCollection(name: string): Collection<any>
    {
        const result =  this.collections.get(name)
        if(!result)
            throw new Error(`Collection ${name} not found`)
        return result
    }
}

export default Database