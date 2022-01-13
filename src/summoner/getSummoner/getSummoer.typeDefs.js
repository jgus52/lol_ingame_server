import { gql } from "apollo-server";

export default gql`
  type Query {
    getSummoner(summonerName: String!): Summoner
  }
`;
