import gql from "graphql-tag";
// import { graphql, } from "react-apollo";

// @2018-06-29 11:10:23
// 注意：此gql会不会产生大量数据？一定要测试好，调用的数据过多，很可能有性能问题
export class ReportType {
  static fragments = {
    details: gql`
      fragment ReportTypeDetails on ReportType {
        id
        processed
        contents
        # contents {
        #   id
        #   informer
        #   content
        # }
        createdAt
        updatedAt
        imageid
        image {
          id
          deleted
          author {
            id
            username
            deleted
          }
        }
        wordid
        word {
          id
          content
          deleted
          author {
            id
            username
            deleted
          }
        }
      }
  `,
  }
};


export class UserType {
  static fragments = {
    details: gql`
      fragment UserTypeDetails on UserType {
        id
        username
        phone
        admin
        deleted
        # token
        createdAt
        updatedAt
      }
  `,
  }
};


