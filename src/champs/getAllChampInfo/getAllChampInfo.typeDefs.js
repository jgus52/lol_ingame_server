import { gql } from "apollo-server-express";

export default gql`
  type AllyInfo {
    champ: [Champ]
    user: Summoner
  }
  type Query {
    getAllChampInfo(summonerNames: [String]): [AllyInfo]
  }
`;
