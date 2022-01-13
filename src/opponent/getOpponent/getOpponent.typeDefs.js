import { gql } from "apollo-server";

export default gql`
  type Query {
    getOpponent(summonerName: String!): [Opponent]
  }
`;
