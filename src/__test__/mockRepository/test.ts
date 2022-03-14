import MockDatabase from '../../types/Database';
import MockRepository from '../../types/MockRepository';
import Author, { IAuthor } from '../models/Author';
import Book, { IBook } from '../models/Book';

MockDatabase.registerModels([
  {
    name: 'Author',
    model: Author,
    CustomModel: Author,
  },
  {
    name: 'Book',
    model: Book,
    CustomModel: Book,
  },
]);

class AuthorRepository extends MockRepository<IAuthor> {}

const authorRepository = new AuthorRepository(MockDatabase, 'Author');
authorRepository.create({
  name: 'Osemudiamen itua',
  age: 'Itua Ose',
} as any);

async function stuff() {
  const result = await authorRepository.find();
  console.log(result);
}

stuff();
