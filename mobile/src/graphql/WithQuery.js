
import { graphql, } from 'react-apollo';

import { QUERY_LOCAL_LOGINED_USER } from './GQLLocal';
import { QUERY_LOCAL_SEARCH_STATUS } from './GQLLocal';
import { QUERY_VISIBLE_MODAL_LISTWORDS } from './GQLLocal';
import { QUERY_LOCAL_PAGINATION_IMAGES } from './GQLLocal';
import { QUERY_METADATA, QUERY_IMAGE, QUERY_WORD, } from './GQLQuery';
import { VARIABLES_CLIENT_IDENTIFY } from '../util/GlobalConst';
import { getInputOssTokenByMetadata } from './GQLTypes';


//导出HOC，子组件props带有loginedUser（从本地缓存访问的）
export const withLocalLoginedUserQuery = () => {
  return graphql(QUERY_LOCAL_LOGINED_USER, {
    name: `loginedUser`,
    props: ({ loginedUser: { loginedUser } }) => ({ loginedUser }),
  })
};


// TODO: 自动将metadata转化为ossToken即可，也就是props直接传递metadata
// export const withImageQuery = () => {
//   return graphql(QUERY_IMAGE, {
//     name: `image`,
//     props: ({ image: { image, error, loading } }) => ({ image, error, loading }),
//     // options: ({ id }) => ({ variables: { id } }),
//     //注意：这里的userToken是给管理员用的。普通用户不用提供userToken即可获取正常数据（标志为deleted=false）
//     // 注意：ossToken是通过读取metadata获取的stsToken，用来从服务器返回signed url。仅在react-native有用，因为rn无法正确使用ali-oss API
//     options: ({ id, userToken, ossToken }) => ({ variables: { id, userToken, ossToken } }),
//   });
// }
// TODO: NOTE: 注意 在ReactNative里面 withImageQuery必须有metadata
// 因为一开始的query image是根据metadata的osstoken获取的，
// 那么需要withImageQuery的也必须提供metadata，否则因为cache里面没有metadata的query对应项，而返回空值，
// 并且把已经获取的image cache数据也清空
export const withImageQuery = () => {
  return graphql(QUERY_IMAGE, {
    name: `image`,
    props: ({ image: { image, error, loading } }) => ({ image, error, loading }),
    // options: ({ id }) => ({ variables: { id } }),
    //注意：这里的userToken是给管理员用的。普通用户不用提供userToken即可获取正常数据（标志为deleted=false）
    // 注意：ossToken是通过读取metadata获取的stsToken，用来从服务器返回signed url。仅在react-native有用，因为rn无法正确使用ali-oss API
    // 注意：这里的id和imageid其实是一个属性，因为有的组件可能用imageid传递（防止id变量名重复）
    options: ({ id, imageid, userToken, metadata }) => {

      // // @2018-08-12 10:48:00 由genPureOssTokenByMetadata代替
      // let pureOssToken = null;
      // if (metadata) {
      //   const { ossToken } = metadata;
      //   if (ossToken) {
      //     // 此处的ossToken包含__typename等属性，不能作为纯粹的InputOssTokenType传递，会出错
      //     const { accessKeyId, accessKeySecret, stsToken, region, bucket, secure } = ossToken;
      //     pureOssToken = { accessKeyId, accessKeySecret, stsToken, region, bucket, secure };
      //   }
      // }

      // 注意：此处顺序很关键：只要指定了imageid，就优先用imageid
      const idValue = imageid ? imageid : id;

      // console.log('withImageQuery userToken: ', userToken);

      return {
        variables: {
          // id,
          id: idValue,
          // userToken,
          userToken: userToken ? userToken : null,
          // ossToken: pureOssToken,
          ossToken: getInputOssTokenByMetadata(metadata),
        }
      };
    },
  });
}


export const withMetadataQuery = (pollInterval) => {
  let options = { variables: VARIABLES_CLIENT_IDENTIFY };
  if (pollInterval) {
    // options = { ...options, pollInterval };
    // console.log(options);
    options.pollInterval = pollInterval;
  }
  // console.log(options);

  return graphql(QUERY_METADATA, {
    name: `metadata`,
    props: ({ metadata: { metadata, error, loading, refetch, } }) => ({ metadata, error, loading, refetch, }),
    // options: () => ({ variables: VARIABLES_CLIENT_IDENTIFY }),
    options
  });
}


export const withWordQuery = () => {
  return graphql(QUERY_WORD, {
    name: `word`,
    props: ({ word: { word, error, loading } }) => ({ word, error, loading }),
    options: ({ id }) => ({ variables: { id } }),
  });
}

// 搜索
export const withLocalSearchStatusQuery = () => {
  return graphql(QUERY_LOCAL_SEARCH_STATUS, {
    name: `localSearchStatus`,
    props: ({ localSearchStatus: { searchStatus } }) => ({ searchStatus }),
  })
};


// listwords对话框
export const withVisibleModalListWordsQuery = () => {
  return graphql(QUERY_VISIBLE_MODAL_LISTWORDS, {
    name: `globalStatus`,
    props: ({ globalStatus: { globalStatus } }) => ({ visibleModalListWords: globalStatus.visibleModalListWords }),
  })
};

// //NOTE:这些error, loading，在with多个Query时会重名覆盖。
// // 如果有好几个withQuery，那么可能真正有错误的error会被其他覆盖
// export const withSearchWordQuery = () => {
//   return graphql(QUERY_SEARCH_WORDS, {
//     name: `search`,
//     props: ({ search: { searchWords, error, loading } }) => ({ searchWords, error, loading }),
//     options: ({ keyword }) => ({ variables: { keyword } }),
//   });
// }

// 游标 图像分页列表
export const withLocalPaginationImagesQuery = () => {
  return graphql(QUERY_LOCAL_PAGINATION_IMAGES, {
    name: `paginationImages`,
  })
};

