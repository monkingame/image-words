import { gql } from "apollo-boost";
// import { QUERY_VISIBLE_MODAL_LISTWORDS } from './GQLLocal';
// import { QUERY_LOGIN, } from './GQLQuery';
import { ImageType, } from './Fragment';



// query globalStatus
const QUERY_GLOBAL_STATUS = gql`
  query {
    globalStatus @client {
      visibleModalListWords
      testStatus
    }
  }
`;


export const resolvers = {
  //参见GQLQuery的QUERY_IMAGE
  ImageType: {
    base64: () => null,
    base64Copying: () => null,
    selectedWord: () => null,
    size: () => null,
    // signedUrlLocal: () => null,
  },

  Mutation: {
    //TODO:改名为updateLocalLoginedUser？需要吗？
    updateLoginedUser: (_, { loginedUser }, { cache, getCacheKey }, ) => {
      // console.log('Mutation updateLoginedUser loginedUser: ', loginedUser);

      cache.writeData({
        data: { loginedUser },
      });
      return loginedUser;
    },

    //更新搜索状态
    updateLocalSearchStatus: (obj, { searchStatus }, { cache, getCacheKey }, ) => {
      // console.log('updateLocalSearchStatus1: ', cache);
      // console.log('updateLocalSearchStatus1: ', searchStatus);

      cache.writeData({
        // __typename: 'SearchStatus',
        data: {
          searchStatus: {
            ...searchStatus,
            __typename: 'SearchStatus',
          }
        },
      });
      // console.log('updateLocalSearchStatus2: ', cache.data);

      return null;
    },

    //TODO:这3个字段一模一样的处理，refactor为一个函数
    // updateImageBase64: (_, { id, base64 }, { cache, getCacheKey }, ) => {
    //   const imageid = getCacheKey({ __typename: 'ImageType', id });
    //   const fragment = gql`
    //     fragment base64Data on ImageType {
    //       base64
    //     }
    //   `;
    //   const image = cache.readFragment({ fragment, id: imageid });
    //   // console.log('resolvers updateImageBase64: ', image, );
    //   const data = { ...image, base64 };
    //   cache.writeData({ id: imageid, data });
    //   return null;
    // },

    //对ImageType的Local Field进行Mutation，分别为：base64、base64Copying、selectedWord，均为@client
    //args:{id:id,selectedWord:xxxxx}
    updateImageLocalField: (_, args, context, ) => {
      const { cache, getCacheKey } = context;
      const { id, ...content } = args;
      const key = Object.keys(content)[0];
      const value = content[key];

      const imageid = getCacheKey({ __typename: 'ImageType', id });
      const fragment = gql`
        fragment ${key}Data on ImageType {
          ${key}
        }
      `;
      const image = cache.readFragment({ fragment, id: imageid });
      const data = { ...image, [key]: value };

      // console.log('updateImageLocalField: ', id, key, imageid, value);
      cache.writeData({ id: imageid, data });

      // cache.writeFragment({
      //   id: imageid,
      //   fragment,
      //   data: {
      //     [key]: value,
      //   }
      // });

      // return data;
      return null;
    },

    // 更新各种全局状态（比如对话框显示隐藏标志位）
    updateVisibleModalListWords: (_, { visible }, { cache, getCacheKey }, ) => {
      // TODO: 没有id的数据 如何用getCacheKey？
      // const status = getCacheKey({
      //   __typename: 'GlobalStatus',
      //   // id: 'globalStatus',
      //   // id: '$ROOT_QUERY.globalStatus',
      // });
      // console.log('updateVisibleModalListWords status : ', status);

      const globalStatus = cache.readQuery({
        query: QUERY_GLOBAL_STATUS,
      }).globalStatus;
      // console.log('updateVisibleModalListWords globalStatus : ', globalStatus);

      cache.writeData({
        data: {
          globalStatus: {
            ...globalStatus,
            visibleModalListWords: visible,
            __typename: 'GlobalStatus',
          }
        },
      });

      return null;
    },

    // 更新游标 @2018-07-24 10:30:28
    updateLocalPaginationCursor: (_, args, context, ) => {
      const { cache, } = context;
      const { cursor } = args;

      cache.writeData({
        data: { paginationCursor: cursor },
      });

      return cursor;
    },

    // 添加游标到本地缓存 @2018-07-24 10:30:30
    addLocalPaginationImages: (_, args, context, ) => {
      const { cache, } = context;
      const { image } = args;
      if (!image) return null;
      // console.log('resolve addLocalPaginationImages image: ', image);

      const query = gql`query {
          paginationImages @client{
            ...ImageTypeDetails
          }
        }
        ${ImageType.fragments.details}
      `;
      const data = cache.readQuery({ query });
      // console.log('resolve addLocalPaginationImages cache data: ', data);

      const { paginationImages } = data;
      // 生成新的副本
      const images = [...paginationImages];
      const index = images.findIndex((ele) => (ele.id === image.id));
      if (index < 0) {
        images.push(image);
      } else {
        images.splice(index, 1, image);
      }
      images.sort((a, b) => {
        const aDate = Date.parse(a.createdAt);
        const bDate = Date.parse(b.createdAt);
        // 降序排列 最新的在最前面（最新为数组索引0）
        return bDate - aDate;
      });

      // console.log('resolve addLocalPaginationImages cache images: ', images);

      cache.writeData({
        data: {
          paginationImages: images
        },
      });


      // const newData = cache.readQuery({ query });
      // console.log('resolve addLocalListImages newData: ', newData);
      return null;
      // return image;
    },




  },
}
