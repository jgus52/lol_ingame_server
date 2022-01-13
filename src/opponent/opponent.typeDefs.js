import { gql } from "apollo-server";

export default gql`
  type Perks {
    perkIds: [Int]
    perkIcons: [String]
    statIcons: [String]
    perkNames: [String]
    perkInfos: [String]
  }
  type Champ {
    id: Int
    win: Int
    lose: Int
    kill: Int
    death: Int
    assist: Int
  }
  type Opponent {
    championId: Int!
    championName: String!
    championInfo: Champ!
    summonerName: String!
    puuid: Int!
    perks: Perks
    spell1Id: Int!
    spell2Id: Int!
    spell1Name: String!
    spell2Name: String!
  }
`;
