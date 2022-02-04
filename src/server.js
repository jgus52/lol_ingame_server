require("dotenv").config();

import express from "express";
import { typeDefs, resolvers } from "./schema.js";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

const startApolloServer = async () => {
  const PORT = process.env.PORT;
  const server = new ApolloServer({
    //introspection: true,
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
  });
  await server.start();

  const app = express();

  app.use(express.static(__dirname));
  server.applyMiddleware({ app });

  app.listen({ port: PORT }, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startApolloServer();
