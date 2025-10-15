import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseConn: MongooseCache | undefined;
}

const cached =
  global.mongooseConn ??
  ({ conn: null, promise: null } satisfies MongooseCache);
global.mongooseConn = cached;

export const connectMongo = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Defina a variável de ambiente MONGODB_URI");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName: "violet",
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
