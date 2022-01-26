import { gql } from "apollo-server";

export default gql`
  type leagueInfo {
    wins: Int
    losses: Int
    tier: String
    rank: String
    leaguePoints: Int
  }
  type Mutation {
    getLeagueInfo(summonerIds: [String!]): [leagueInfo]
  }
`;
