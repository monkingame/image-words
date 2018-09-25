
export const defaults = {
  //已登录用户
  loginedUser: null,

  //TODO:localMetadata已经无用，直接QUERY_METADATA即可
  // localMetadata: null,

  //是否在搜索状态
  searchStatus: {
    keyword: '',
    inSearch: false,
    __typename: 'SearchStatus',
  },
  // searchStatus: null,

  // 各种状态值
  globalStatus: {
    visibleModalListWords: false,
    testStatus: 100,
    __typename: 'GlobalStatus',
  },

  // 全屏翻页cursor @2018-07-24 10:16:48
  paginationCursor: (new Date()).toISOString(),

  // 全屏翻页列表 @2018-07-24 10:16:50
  paginationImages: [],
};
