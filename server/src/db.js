import mongoose from 'mongoose';

let connectionPromise;

export function connectDatabase() {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose.connection);
  if (connectionPromise) return connectionPromise;

  const uri = process.env.MONGODB_URI || (process.env.NODE_ENV === 'production' ? '' : 'mongodb://127.0.0.1:27017/appointment_manager');
  if (!uri) return Promise.reject(new Error('MONGODB_URI must be configured'));

  connectionPromise = mongoose.connect(uri).then(() => mongoose.connection).catch(error => {
    connectionPromise = undefined;
    throw error;
  });
  return connectionPromise;
}
