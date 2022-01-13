import { gql } from "apollo-server";

export default gql`
  type Summoner {
    accountId: String!
    summonerName: String!
    tier: String
    rank: String
    wins: Int
    losses: Int
  }
`;
