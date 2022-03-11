import { Schema, model, Model, Document } from 'mongoose';

export interface IAuthor extends Document {
  name: string;
  age: number;
}

const authorSchema = new Schema<IAuthor>({
  name: {
    type: String,
  },
  age: {
    type: Number,
  },
});

const Author = model<IAuthor>('Author', authorSchema);
export default Author;
