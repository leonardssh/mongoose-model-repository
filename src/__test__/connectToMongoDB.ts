import { connect, ConnectOptions } from 'mongoose';

const connectToMongoDB = async (): Promise<void> => {
  try {
    const url = 'mongodb://localhost:27017/test';
    await connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);
    console.log('DB connected successfully');
  } catch (err) {
    console.log(err);
    console.log('DB connection not successful');
  }
};

export default connectToMongoDB;
