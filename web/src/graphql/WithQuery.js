
import { graphql, } from 'react-apollo';

import { QUERY_LOCAL_LOGINED_USER } from './GQLLocal';
import { QUERY_LOCAL_SEARCH_STATUS } from './GQLLocal';
// import { QUERY_METADATA, QUERY_IMAGE, QUERY_WORD, QUERY_SEARCH_WORDS, } from './GQLQuery';
import { QUERY_METADATA, QUERY_IMAGE, QUERY_WORD, } from './GQLQuery';
import { VARIABLES_CLIENT_IDENTIFY } from '../util/GlobalConst';


//导出HOC，子组件props带有loginedUser（从本地缓存访问的）
export const withLocalLoginedUserQuery = () => {
  return graphql(QUERY_LOCAL_LOGINED_USER, {
    name: `loginedUser`,
    props: ({ loginedUser: { loginedUser } }) => ({ loginedUser }),
  })
};


export const withImageQuery = () => {
  return graphql(QUERY_IMAGE, {
    name: `image`,
    props: ({ image: { image, error, loading } }) => ({ image, error, loading }),
    // options: ({ id }) => ({ variables: { id } }),
    //注意：这里的userToken是给管理员用的。普通用户不用提供userToken即可获取正常数据（标志为deleted=false）
    options: ({ id, userToken }) => ({ variables: { id, userToken } }),
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
    props: ({ metadata: { metadata, error, loading } }) => ({ metadata, error, loading }),
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

export const withLocalSearchStatusQuery = () => {
  return graphql(QUERY_LOCAL_SEARCH_STATUS, {
    name: `localSearchStatus`,
    props: ({ localSearchStatus: { searchStatus } }) => ({ searchStatus }),
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

