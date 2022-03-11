import Repository from '../types/Repository';
import { IAuthor } from './models/Author';
import { IBook } from './models/Book';

export class AuthorRepository extends Repository<IAuthor> {}
export class BookRepository extends Repository<IBook> {}
