import React, { Component, PureComponent } from 'react';
import { StyleSheet, View, Text, FlatList, } from 'react-native';
// import { graphql, compose, withApollo, } from "react-apollo";

// import { withMetadataQuery, } from '../graphql/WithQuery';
// import { withLocalLoginedUserQuery } from '../graphql/WithQuery';
// import { QUERY_MORE_FAVORITES } from '../graphql/GQLQuery';
// import { PAGI_IMAGE_LIMIT } from '../util/GlobalConst';
// import ButtonCommon from '../components/button/ButtonCommon';
// import { BUTTON_TYPE_MORE } from '../components/button/ButtonConst';
// import { ImageFromServerUrl, OssImageWithWord } from '../components';
// import { SelectedWordsLabelStyle as StyleLabel } from '../components';

import { WIDTH_CHILD, } from '../util/DimesionUtil';


export const WIDTH_FAVORITE_ITEM = WIDTH_CHILD - 10;
export const HEIGHT_FAVORITE_ITEM = 220;
export const HEIGHT_FAVORITE_WORD = 24;
export const SCALE_WIDTH_IMAGE = 5 / 6;


export default styles = StyleSheet.create({
  container: {
    flex: 1,
    // height: HEIGHT_CHILD + HEIGHT_TOP_CTRL_BAR,
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: 'red',
    // borderRadius: 6,
  },
  favoriteList: {
    flex: 1,
    // backgroundColor: '#ddeeff',
    alignItems: 'center',
    justifyContent: 'center',
    width: WIDTH_CHILD,
    // borderWidth: 1,
    // borderColor: 'red',
    margin: 10,
  },
  ctrlMoreContainer: {
    // flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: 'blue',
  },
  // 排列 从右边开始排列 让图像自动适应，但按钮区域固定尺寸
  itemFavorite: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
    width: WIDTH_FAVORITE_ITEM,
    height: HEIGHT_FAVORITE_ITEM,
    // borderWidth: 1,
    borderBottomWidth: 1,
    // borderRadius: 6,
    borderColor: '#DBDBDBCC',
    // borderColor: 'green',
  },
  // imageWithWord是为了占位
  imageWithWord: {
    flex: 5,
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: 'blue',
    // borderRadius: 6,
  },
  // imageFavorite是为了让图片自适应，方便截图
  imageFavorite: {
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
    // borderRadius: 3,
    // borderColor: 'green',
  },
  ctrlFavorite: {
    flex: 1,
    width: 50,
    height: HEIGHT_FAVORITE_ITEM,
    // flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 1,
    // borderColor: 'red',
  },
});

