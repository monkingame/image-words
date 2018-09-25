
import gql from "graphql-tag";
// import { graphql, } from 'react-apollo';
import { ImageType, } from './Fragment';


// const _ = require('lodash');

// export const QUERY_LOCAL_METADATA = gql`
//   query{
//     localMetadata @client{
//       clientKey
//       version
//     }
//   }
// `;

// query 用户
export const QUERY_LOCAL_LOGINED_USER = gql`
  query{
    loginedUser @client{
      id
      username
      token
    }
  }
`;

// mutation 用户
export const MUT_LOCAL_LOGINED_USER = gql`
  mutation UpdateLoginedUser($loginedUser: LoginedUser!) {
    updateLoginedUser(loginedUser: $loginedUser)@client {
      id
      username
      token
    }
  }
`;

// query 搜索状态
export const QUERY_LOCAL_SEARCH_STATUS = gql`
  query {
    searchStatus @client {
      inSearch
      keyword
    }
  }
`;

// mutation 搜索状态
export const MUT_LOCAL_SEARCH_STATUS = gql`
  mutation UpdateLocalSearchStatus($searchStatus: SearchStatus!) {
    updateLocalSearchStatus(searchStatus: $searchStatus) @client{
      inSearch
      keyword
    }
  }
`;

// query 状态 words list 对话框
export const QUERY_VISIBLE_MODAL_LISTWORDS = gql`
  query {
    globalStatus @client {
      visibleModalListWords
    }
  }
`;

// mutation 搜索状态
export const MUT_VISIBLE_MODAL_LISTWORDS = gql`
  mutation UpdateVisibleModalListWords($visible: Boolean!) {
    updateVisibleModalListWords(visible: $visible) @client{
      visibleModalListWords
    }
  }
`;



// 查询游标 @2018-07-24 10:33:45
export const QUERY_LOCAL_PAGINATION_CURSOR = gql`
  query {
    paginationCursor @client
  }
`;

// 在全屏翻页模式下，保存的图像列表 @2018-07-24 10:33:47
export const QUERY_LOCAL_PAGINATION_IMAGES = gql`
  query {
    paginationImages @client{
      ...ImageTypeDetails
    }
  }

  ${ImageType.fragments.details}
`;


// 写入游标
export const MUT_LOCAL_PAGINATION_CURSOR = gql`
  mutation UpdateLocalPaginationCursor($cursor:String!){
    updateLocalPaginationCursor(cursor:$cursor) @client
  }
`;


// 增加图像到本地图像列表
export const MUT_ADD_LOCAL_PAGINATION_IMAGES = gql`
  mutation AddLocalPaginationImages($image: ImageType!){
    addLocalPaginationImages(image: $image) @client
  }
`;


// export const MUT_LOCAL_IMAGE_BASE64 = gql`
//   mutation UpdateBase64($id:ID!,$base64: String!) {
//     updateImageBase64(id:$id, base64: $base64) @client
//   }
// `;

// export const MUT_LOCAL_IMAGE_BASE64COPY = gql`
//   mutation UpdateBase64Copy($id:ID!,$base64Copying: String!) {
//     updateImageBase64Copy(id:$id, base64Copying: $base64Copying) @client
//   }
// `;

// export const MUT_LOCAL_IMAGE_SELECTEDWORD = gql`
//   mutation UpdateSelectedWord($id:ID!,$selectedWord: String!) {
//     updateImageSelectedWord(id:$id, selectedWord: $selectedWord) @client
//   }
// `;


// //NOTE:将写数据动作封装，防止四处乱写
// // 感觉QUERY_LOCAL_METADATA没有用呢？
// // 因为直接从QUERY_METADATA缓存里面读取即可啊
// // 注：略微有点用。正常QUERY_METADATA需要参数clientId
// // 但因为这些都是常量，只要提取出const 把clientId发出去即可
// // 所以 还是不需要QUERY_LOCAL_METADATA
// export const UpdateLocalMetadata = ({ client, metadata }) => {
//   if (!client) return;
//   // client.writeQuery({
//   //   query: QUERY_LOCAL_METADATA,
//   //   data: { localMetadata: metadata },
//   // });
//   // console.log('UpdateLocalMetadata : ', metadata);
//   client.writeData({
//     data: { localMetadata: metadata },
//   });
// }

// //NOTE:将写数据动作封装，防止四处乱写
// export const UpdateLocalLoginedUser = ({ client, login }) => {
//   if (!client) return;
//   // client.writeQuery({
//   //   query: QUERY_LOCAL_LOGINED_USER,
//   //   data: { loginedUser },
//   // });
//   // console.log('UpdateLocalLoginedUser : ', login);
//   client.writeData({
//     data: { loginedUser: login },
//   });
// }

