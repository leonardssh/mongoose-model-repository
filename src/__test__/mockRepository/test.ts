import MockDatabase from '../../types/Database';
import MockRepository from '../../types/MockRepository';
import connectToMongoDB from '../connectToMongoDB';
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

async function stuff() {
  try {
    const doc = (await authorRepository.create({
      name: 'Osemudiamen itua',
      age: 45,
    } as IAuthor)) as IAuthor;

    let result = await authorRepository.find({}, { select: '-name +age' });
    console.log('second', result);
  } catch (error) {
    console.log(error);
  }
}

stuff();
