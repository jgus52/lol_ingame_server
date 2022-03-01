import { gql } from "apollo-server-express";

export default gql`
  type Match {
    championImg: String
    matchId: String
    win: Boolean
    kills: Int
    deaths: Int
    assist: Int
  }
`;
