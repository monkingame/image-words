
import gql from "graphql-tag";

export class ImageType {
  static fragments = {
    details: gql`
      fragment ImageTypeDetails on ImageType {
        id
        filename
        vote
        deleted
        # author{
        #   id
        #   username
        # }
        authorid
        base64 @client
        base64Copying @client
        selectedWord @client
        size @client{
          width
          height
        }
        createdAt
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

