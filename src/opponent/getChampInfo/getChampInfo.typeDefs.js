import { gql } from "apollo-server";

export default gql`
  type Query {
    getChampInfo(summonerIds: [String!], championIds: [Int!]): [Champ]
  }
`;
