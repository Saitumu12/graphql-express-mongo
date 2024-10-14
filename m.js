const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB is  Connected"))
  .catch(err => console.log(err));

const userSchema = new mongoose.Schema({
  name: String,
  age: Number
});

const User = mongoose.model('User', userSchema);

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    age: Int
  }

  type Query {
    getUsers(limit: Int, offset: Int, age: Int): [User]
    getUser(id: ID!): User
  }

  type Mutation {
    createUser(name: String!, age: Int): User
    updateUser(id: ID!, name: String, age: Int): User
  }
`;

const resolvers = {
  Query: {
    getUsers: async (_, { limit = 10, offset = 0, age }) => {
      const filter = age ? { age: { $gte: age } } : {};
      return await User.find(filter).skip(offset).limit(limit);
    },
    getUser: async (_, { id }) => {
      return await User.findById(id);
    }
  },
  Mutation: {
    createUser: async (_, { name, age }) => {
      const user = new User({ name, age });
      return await user.save();
    },
    updateUser: async (_, { id, name, age }) => {
      return await User.findByIdAndUpdate(id, { name, age }, { new: true });
    }
  }
};

const app = express();

const server = new ApolloServer({ typeDefs, resolvers });
await server.start();
server.applyMiddleware({ app });

app.listen(4000, () => {
  console.log(serevr ready at http://localhost:4000${server.graphqlPath}`);
});
