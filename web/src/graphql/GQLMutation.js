import gql from "graphql-tag";
import { ImageType, WordType } from './Fragment';



export const MUT_ADD_USER = gql`
  mutation AddUser($username: String!, $password: String!, $clientId: InputMetaIdentify!) {
    addUser(username: $username, password: $password, clientId: $clientId) {
      id
      username
      token
    }
  }
`;

export const MUT_CHANGE_PASSWORD=gql`
  mutation ChangePassword($token: String!, $id: ID!, $password: String!) {
    changePassword(token: $token, id: $id, password: $password) {
      id
      username
      token
    }
  }
`;

// export const MUT_ADD_IMAGE = gql`
//   mutation AddImage($newImageData:InputNewImageData!){
//     addImage(newImageData:$newImageData){
//       id
//       filename
//       vote
//       deleted
//       authorid
//       base64 @client
//       base64Copying @client
//       selectedWord @client
//       words{
//         id
//         content
//       }
//     }
//   }
// `;

// TODO: words 不需要了，新建看图说说后，ImageWords会从服务器自动拉取数据
export const MUT_ADD_IMAGE = gql`
  mutation AddImage($newImageData:InputNewImageData!){
    addImage(newImageData:$newImageData){
      ...ImageTypeDetails
      # words{
      #   id
      #   content
      # }
    }
  }

  ${ImageType.fragments.details}
`;

//TODO:此处delImage信息是否也要用...ImageTypeDetails代替？
export const MUT_DEL_IMAGE = gql`
  mutation DelImage($userToken: String!, $id: ID!, $deleted:Boolean) {
    delImage(userToken: $userToken, id: $id, deleted:$deleted) {
      id
      filename
      deleted
    }
  }
`;


// export const MUT_VOTE_WORD = gql`
//   mutation VoteWord($userToken: String!, $id: ID!, $vote: Boolean!) {
//     voteWord(userToken: $userToken, id: $id, vote: $vote) {
//       id
//       content
//       vote
//       image {
//         id
//         vote
//       }
//     }
//   }
// `;

// export const MUT_VOTE_WORD = gql`
//   mutation VoteWord($userToken: String!, $id: ID!, $vote: Boolean!) {
//     voteWord(userToken: $userToken, id: $id, vote: $vote) {
//       ...WordTypeDetails
//       image {
//         id
//         vote
//       }
//     }
//   }

//   ${WordType.fragments.details}
// `;

export const MUT_VOTE_WORD = gql`
  mutation VoteWord($userToken: String, $id: ID!, $vote: Boolean!) {
    voteWord(userToken: $userToken, id: $id, vote: $vote) {
      ...WordTypeDetails
      image {
        id
        vote
      }
    }
  }

  ${WordType.fragments.details}
`;


// export const MUT_DEL_WORD = gql`
//   mutation DelWord($userToken: String!, $id: ID!) {
//     delWord(userToken: $userToken, id: $id) {
//       id
//       content
//       deleted
//       # author {
//       #   id
//       # }
//       authorid
//     }
//   }
// `;
export const MUT_DEL_WORD = gql`
  mutation DelWord($userToken: String!, $id: ID!, $deleted:Boolean) {
    delWord(userToken: $userToken, id: $id, deleted:$deleted) {
      ...WordTypeDetails
    }
  }

  ${WordType.fragments.details}
`;


// export const MUT_ADD_WORD = gql`
//   mutation AddWord($userToken: String!, $content: String!, $imageid: ID!) {
//     addWord(userToken: $userToken, content: $content, imageid: $imageid) {
//       id
//       content
//       vote
//       # image {
//       #   id
//       # }
//       imageid
//     }
//   }
// `;


export const MUT_ADD_WORD = gql`
  mutation AddWord($userToken: String!, $content: String!, $imageid: ID!) {
    addWord(userToken: $userToken, content: $content, imageid: $imageid) {
      ...WordTypeDetails
    }
  }

  ${WordType.fragments.details}
`;


export const MUT_ADD_REPORT = gql`
  mutation AddReport($userToken: String!, $content: String!, $imageid: ID!, $wordid: ID) {
    addReport(userToken: $userToken, content: $content, imageid: $imageid, wordid: $wordid) {
      id
      # content
      # informerid
    }
  }
`;

// // TODO:admin only
// export const MUT_DEL_REPORT = gql`
//   mutation DelReport($operToken: String!, $id: ID!, $deleted: Boolean) {
//     delReport(operToken: $operToken, id: $id, deleted: $deleted) {
//       id
//       content
//       deleted
//       processed
//       informerid
//     }
//   }
// `;

export const MUT_SWITCH_BLOCK=gql`
  mutation SwitchBlock($userToken: String!, $banid: ID!, $banned: Boolean!) {
    switchBlock(userToken: $userToken, banid: $banid, banned: $banned)
  }
`;

