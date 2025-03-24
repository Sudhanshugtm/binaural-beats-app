import { MongoClient } from 'mongodb'

// Since this app doesn't actually use authentication or database features
// we're setting up a mock MongoDB client that doesn't actually connect
// This allows the app to build and deploy without actual MongoDB credentials

// Create a mock client that resolves to a minimal MongoDB client implementation
const mockClient = {
  db: () => ({
    collection: () => ({
      findOne: async () => null,
      insertOne: async () => ({ insertedId: 'mock-id' }),
      updateOne: async () => ({ modifiedCount: 1 }),
      deleteOne: async () => ({ deletedCount: 1 })
    })
  }),
  connect: async () => mockClient
} as unknown as MongoClient;

// Export a promise that resolves to our mock client
const clientPromise = Promise.resolve(mockClient);

export default clientPromise