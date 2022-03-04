import { gql } from "apollo-server-express";

export default gql`
  type Query {
    getAllChampInfo(puuids: [String], take: Int, cursor: String): [[Champ]]
  }
`;
