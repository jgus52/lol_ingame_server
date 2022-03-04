import { gql } from "apollo-server-express";

export default gql`
  type Query {
    getFullRecentMatches(puuid: String, take: Int, cursor: String): [Match]
  }
`;
