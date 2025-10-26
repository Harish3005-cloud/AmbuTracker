import mongoose from 'mongoose';

/* This is a Mongoose connection helper for Next.js in a serverless environment.
  It caches the connection between function invocations to improve performance.
*/

// Define a cached object type.
// 'any' is used here for simplicity in a global context.
let cached: {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
} = (global as any).mongoose;

if (!cached) {
  console.log('Creating new connection');
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDB() {
  console.log('Connecting to database');
  // If we have a cached connection, return it
  if (cached.conn) {
    console.log('Using cached connection');
    return cached.conn;
  }

  // If there's no connection promise, create one
  if (!cached.promise) {
    const MONGODB_URI = process.env.MONGODB_URI;
    console.log('Creating new connection', MONGODB_URI);

    if (!MONGODB_URI) {
      throw new Error(
        'Please define the MONGODB_URI environment variable inside .env.local'
      );
    }

    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => {
      return mongoose;
    });
  }

  // Await the promise to get the connection and cache it
  try {
    cached.conn = await cached.promise;
    console.log('Connection successful');
  } catch (e) {
    console.error('Connection failed', e);
    cached.promise = null; // Reset promise on error
    throw e;
  }

  return cached.conn;
}