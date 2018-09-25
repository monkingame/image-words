
import gql from "graphql-tag";

// NOTE: signedUrl是从服务器直接获取的 signedUrlLocal是将signedUrl再保存到本地
// 这样做的原因是 如果统一用QUERY_IMAGE访问，如果不提供OssToken，那么signedurl可能会被覆盖为null
export class ImageType {
  static fragments = {
    details: gql`
      fragment ImageTypeDetails on ImageType {
        id
        filename
        vote
        deleted
        authorid
        base64 @client
        base64Copying @client
        selectedWord @client
        # size @client{
        #   width
        #   height
        # }
        # TODO: 感觉size没有代码使用？
        size @client
        createdAt
        signedUrl
        # signedUrlLocal @client
      }
  `,
  }
};


export class WordType {
  static fragments = {
    details: gql`
      fragment WordTypeDetails on WordType {
        id
        content
        vote
        imageid
        authorid
        deleted
        createdAt
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
        email
        phone
        phoneVerified
        token
        admin
        deleted
        createdAt
        updatedAt
      }
  `,
  }
};

