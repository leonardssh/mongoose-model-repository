import connectToMongoDB from '../connectToMongoDB';
import Author, { IAuthor } from '../models/Author';
import { AuthorRepository } from '../TestRepos';
import { assert } from 'chai';
import mockAuthors from '../mocks/mockAuthors';

let authorRepository: AuthorRepository;
const name = 'Osemudiamen Itua';
const age = 45;

describe('TEST FOR REPOSITORY CLASS: Create document function', () => {
  before(async () => {
    await connectToMongoDB();
    await Author.deleteMany({});
    authorRepository = new AuthorRepository(Author);
  });
  after(async () => {
    await Author.deleteMany({});
  });

  it('It should create one document successfully', (done) => {
    const toBeSaved = {
      name,
      age,
    } as IAuthor;

    authorRepository.create(toBeSaved).then((data) => {
      assert.isNotNull(data);
      assert.equal((data as IAuthor).name, toBeSaved.name);
      assert.equal((data as IAuthor).age, toBeSaved.age);
      done();
    });
  });

  it('Document should now be in the database', (done) => {
    Author.findOne({}).then((data) => {
      assert.isNotNull(data);
      assert.equal(data?.name, name);
      assert.equal(data?.age, age);
      done();
    });
  });

  it('It should create multiple documents successfully', (done) => {
    authorRepository.create(mockAuthors).then((data) => {
      assert.isNotNull(data);
      assert.isArray(data);
      assert.equal((data as IAuthor[])[0].name, mockAuthors[0].name);
      assert.equal((data as IAuthor[])[0].age, mockAuthors[0].age);
      assert.equal((data as IAuthor[]).length, mockAuthors.length);
      done();
    });
  });

  it('Documents should now be in the database', (done) => {
    Author.find({}).then((data) => {
      assert.isNotNull(data);
      assert.isArray(data);
      assert.equal(data.length, mockAuthors.length + 1);
      done();
    });
  });
});
