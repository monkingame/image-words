
// graphql server
// export const URI_GRAPHQL_SERVER = `http://192.168.1.105:3001/gql`;
// export const URI_GRAPHQL_SERVER = `http://192.168.1.105:3001/gql`;
// @2018-06-21 17:18:24
// export const URI_GRAPHQL_SERVER = `https://kantushuoshuo.com/api`;
export const URI_GRAPHQL_SERVER = __DEV__ ?
  `http://192.168.0.108:3001` :
  `https://ip.ip.ip.ip`;


//STS定时器在55分钟启动一次（55*60*1000），是为了防止一个小时（STS key的最长有效期限）到了之后STS key过期
export const INTERNAL_FETCH_STS = 55 * 60 * 1000;
// export const INTERNAL_FETCH_STS = 3 * 1000;

//允许输入最大长度
export const WORDS_MAX_LENGTH = 12;

//禁止输入时间间隔
export const DISABLE_INPUT_INTERVAL = 3;

// export const CLIENT_IDENTIFY_MSG = {
//   clientVersion: `1.000.100`,
//   clientIdentifyKey: `web-client-image-word`,
// };
//QUERY_METADATA拉取服务器的metadata的传入参数
export const VARIABLES_CLIENT_IDENTIFY = {
  clientId: {
    clientVersion: `1.1.0`,
    // clientIdentifyKey: `web-client-image-word`,
    clientIdentifyKey: `react-native-client-image-word`,
  }
};


//words 分页限制
export const PAGI_WORDS_LIMIT = 12;

//image 分页限制
export const PAGI_IMAGE_LIMIT = 3;

//search 分页限制
export const PAGI_SEARCH_LIMIT = 3;

