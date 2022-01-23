import { gql } from "apollo-server";

export default gql`
  type Champ {
    win: Int
    lose: Int
    kill: Int
    death: Int
    assist: Int
  }
  type Query {
    getChampInfo(summonerIds: [String!], championIds: [Int!]): [Champ]
  }
`;
