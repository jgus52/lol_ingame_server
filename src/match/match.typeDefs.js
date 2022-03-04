import { gql } from "apollo-server-express";

export default gql`
  type MatchParticipant {
    championImg: String
    championId: String
    matchId: String
    win: Boolean
    kills: Int
    deaths: Int
    assist: Int
  }
  type Match {
    matchId: String
    participants: [MatchParticipant]
    championImg: String
    championId: String
    win: Boolean
    kills: Int
    deaths: Int
    assist: Int
  }
`;
