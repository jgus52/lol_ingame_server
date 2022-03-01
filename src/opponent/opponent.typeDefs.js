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
    championName: String
    championImg: String
    win: Int
    lose: Int
    kill: Int
    death: Int
    assist: Int
  }
  type Opponent {
    championId: Int!
    championName: String!
    championImg: String!
    championInfo: Champ
    summonerName: String!
    summonerId: String!
    teamId: Int!
    puuid: String
    perks: Perks
    spell1Img: String!
    spell2Img: String!
  }
`;
