import gql from "graphql-tag";
// import { graphql, } from 'react-apollo';
import { ImageType, WordType, UserType, } from './Fragment';

// export const QUERY_METADATA = gql`
//   query{
//     metadata{
//       clientKey
//       version
//     }
//   }
// `;

export const QUERY_METADATA = gql`
query QueryMetadata($clientId:InputMetaIdentify!){
  metadata(clientId:$clientId) {
    clientKey
    version
    eula
    ossToken {
      accessKeyId
      accessKeySecret
      stsToken
      region
      bucket
      secure
    }
    timestamp
  }
}`;


//TODO:deprecated
// export const QUERY_USERS = gql`
//   query{
//     users{
//       id
//       username
//       phone
//       email
//       admin
//     }
//   }
// `;

export const QUERY_USER_EXIST = gql`
  query UserExist($username:String!){
    userExist(username:$username) 
  }
`;

export const QUERY_LOGIN = gql`
  query Login($username:String!,$password:String!){
    login(username:$username,password:$password){
      # id
      # username
      # token
      ...UserTypeDetails
    }
  }
  
  ${UserType.fragments.details}
`;


export const QUERY_LOGOUT = gql`
  query Logout($userToken: String) {
    logout(userToken: $userToken) {
      # id
      # username
      ...UserTypeDetails
    }
  }

  ${UserType.fragments.details}
`;


// @2018-06-28 18:17:26
// 通过token查询用户是否有效（比如被删除的用户 就是无效用户）
export const QUERY_USER_BY_TOKEN = gql`
  query UserByToken($token: String!) {
    userByToken(token: $token) {
      # id
      # username
      # deleted
      ...UserTypeDetails
    }
  }

  ${UserType.fragments.details}
`;


// //注册成功后，将注册用户加入到登录列表中
// //TODO:此函数应该放在Local文件内
// export const UpdateRegisterUserAutoLogin = ({ client, login, variables }) => {
//   if (!client || !login || !variables) return;
//   // console.log('UpdateRegisterUserAutoLogin : ', login);
//   const { username, password } = variables;
//   client.writeQuery({
//     query: QUERY_LOGIN,
//     data: { login },
//     variables: { username, password }
//   });
// }

// //TODO:deprecated
// export const QUERY_LIST_IMAGES = gql`
//   query ListImages {
//     images {
//       ...ImageTypeDetails
//     }
//   }

//   ${ImageType.fragments.details}
// `;

//注意 此处的 $userToken 不是必须的
export const QUERY_IMAGE = gql`
  query Image($id: ID!, $userToken: String, $ossToken: InputOssTokenType) {
    image(id: $id, userToken: $userToken, ossToken: $ossToken) {
      ...ImageTypeDetails
    }
  }

  ${ImageType.fragments.details}
`;

//注意 此处的 $userToken 不是必须的(如果是管理员，会将已删除图片也列出来)
// TODO: 要被取代，准备删除，用QUERY_NEXT_IMAGE代替
export const QUERY_MORE_IMAGES = gql`
  query MoreImages($offset: Int!, $limit: Int!, $userToken:String) {
    moreImages(offset: $offset, limit: $limit, userToken: $userToken) @connection(key: "moreImages") {
      ...ImageTypeDetails
    }
  }

  ${ImageType.fragments.details}
`;


// cursor模式：下一个图像 @2018-07-24 10:35:36
export const QUERY_NEXT_IMAGE = gql`
  query NextImage($cursor: DateTime!, $direction: String!, $ossToken: InputOssTokenType, $operToken: String) {
    nextImage(cursor: $cursor, direction: $direction, ossToken: $ossToken, operToken: $operToken) @connection(key: "nextImage") {
      ...ImageTypeDetails
    }
  }

  ${ImageType.fragments.details}
`;


// export const QUERY_LIST_WORDS = gql`
//   query ListWords {
//     words {
//       id
//       content
//     }
//   }
// `;


//注意 此处的 $userToken 不是必须的
export const QUERY_WORD = gql`
  query QueryWord($id: ID!, $userToken:String) {
    word(id: $id, userToken: $userToken) {
      ...WordTypeDetails
    }
  }

  ${WordType.fragments.details}
`;

//注意 此处的 $userToken 不是必须的
export const QUERY_MORE_WORDS_BY_IMAGEID = gql`
  query MoreWordsByImageId($imageid: ID!, $offset: Int!, $limit: Int!, $userToken:String) {
    moreWordsByImageId(imageid: $imageid, offset: $offset, limit: $limit, userToken: $userToken) @connection(key: "moreWordsByImageId", filter: ["imageid"]) {
      ...WordTypeDetails
    }
  }

  ${WordType.fragments.details}
`;


// 此列表不再有效，防止恶意数据拉取
// export const QUERY_WORDS_BY_IMAGEID = gql`
//   query ListWordsByImageId($imageid: ID!) {
//     wordsByImageId(imageid: $imageid) {
//       ...WordTypeDetails
//     }
//   }
//   ${WordType.fragments.details}
// `;


// export const QUERY_SEARCH_WORDS = gql`
//   query SearchWords($keyword: String!) {
//     searchWords(keyword: $keyword) {
//       ...WordTypeDetails
//     }
//   }

//   ${WordType.fragments.details}
// `;


export const QUERY_SEARCH_MORE_WORDS = gql`
  query SearchMoreWords($keyword: String!, $offset: Int!, $limit: Int!) {
    searchMoreWords(keyword: $keyword, offset: $offset, limit: $limit) {
      ...WordTypeDetails
    }
  }

  ${WordType.fragments.details}
`;

//TODO:移植到admin里面

// export const QUERY_MORE_REPORTS = gql`
//   query MoreReports($operToken: String!, $offset: Int!, $limit: Int!) {
//     moreReports(operToken: $operToken, offset: $offset, limit: $limit) {
//       id
//       content
//       deleted
//       processed
//       informerid
//     }
//   }
// `;


// export const QUERY_REPORTS_COUNT=gql`
//   query ReportsCount($operToken: String!) {
//     reportsCount(operToken: $operToken)
//   }
// `;

// block 屏蔽
export const QUEREY_BLOCK = gql`
  # query Block($userToken: String!, $banid: ID!) {
  query Block($userToken: String, $banid: ID!) {
    block(userToken: $userToken, banid: $banid)
  }
`;

export const QUERY_SIGNED_URL = gql`
  query SignedUrl($ossToken: InputOssTokenType!, $filename: String!) {
    signedurl(ossToken: $ossToken, filename: $filename)
  }
`;

// favorite 收藏
export const QUEREY_FAVORITE = gql`
  query Favorite($userToken: String!, $imageid: ID!) {
    favorite(userToken: $userToken, imageid: $imageid)
  }
`;

// favorite list 收藏列表
export const QUERY_MORE_FAVORITES = gql`
  query MoreFavorites($offset: Int!, $limit: Int!, $operToken: String!) {
    moreFavorites(offset: $offset, limit: $limit, operToken: $operToken) @connection(key: "moreFavorites") {
      id
      imageid
      favorited
      ownerid
      word
    }
  }
`;

export const QUERY_SMS_VERIFY_CODE = gql`
  query GetSMSVerifyCode($userToken: String!) {
    getSMSVerifyCode(userToken: $userToken)
  }
`;

