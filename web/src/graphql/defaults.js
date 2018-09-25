
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


  // 全屏翻页cursor
  paginationCursor: (new Date()).toISOString(),

  // 全屏翻页列表
  paginationImages: [],
};

