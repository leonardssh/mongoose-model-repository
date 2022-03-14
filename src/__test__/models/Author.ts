import { Schema, model, Model, Document } from 'mongoose';

export interface IAuthor extends Document {
  name: string;
  age: number;
}

const authorSchema = new Schema<IAuthor>(
  {
    name: {
      type: String,
      required: [true, 'The name of the author is quite required'],
    },
    age: {
      type: Number,
      default: 100,
    },
  },
  { timestamps: true }
);

const Author = model<IAuthor>('Author', authorSchema);
export default Author;
