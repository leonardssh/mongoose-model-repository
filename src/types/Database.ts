import Collection from "./Collection";
import { NameModelMap } from "./others";
import {Document, Model} from 'mongoose'

class Database{
    static instance: Database | null = null;
    private collections: Map<string,Collection<any>> = new Map

    private constructor( modelData : NameModelMap<any> | NameModelMap<any>[] = []){
    }

    static getInstance():Database
    {
        if(!Database.instance) Database.instance = new Database
        return Database.instance

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

const MockDatabase = Database.getInstance()
export default MockDatabase