import { gql } from "apollo-server";

export default gql`
  type updateReturn {
    ok: Boolean
    message: String
  }
  type Mutation {
    updateChampsInfo(puuids: [String!]): updateReturn
  }
`;
