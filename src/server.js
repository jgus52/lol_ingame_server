require("dotenv").config();

import { typeDefs, resolvers } from "./schema.js";
import { ApolloServer } from "apollo-server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

const PORT = process.env.PORT;
const server = new ApolloServer({
  introspection: true,
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
});

server.listen({ port: PORT }).then(() => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
