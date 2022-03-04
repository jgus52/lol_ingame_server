import { gql } from "apollo-server";

export default gql`
  type Summoner {
    accountId: String!
    puuid: String!
    id: String!
    name: String!
    profileIcon: String
  }
`;
