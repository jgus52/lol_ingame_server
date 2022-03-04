import { gql } from "apollo-server-express";

export default gql`
  type Query {
    getRecentMatches(
      puuids: [String]
      take: Int
      cursor: String
    ): [[MatchParticipant]]
  }
`;
