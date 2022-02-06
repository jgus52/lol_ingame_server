import { gql } from "apollo-server";

export default gql`
  type Summoner {
    accountId: String!
    puuid: String!
    id: String!
    name: String!
    tier: String
    rank: String
    wins: Int
    losses: Int
  }
`;
