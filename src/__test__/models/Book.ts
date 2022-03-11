import { Schema, model, Model, Document, PopulatedDoc } from 'mongoose';
import { IAuthor } from './Author';

export interface IBook extends Document {
  title: string;
  author: PopulatedDoc<IAuthor>;
}

const bookSchema = new Schema<IBook>({
  title: {
    type: String,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'Author',
  },
});

const Book = model<IBook>('Book', bookSchema);
export default Book;
