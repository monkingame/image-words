import React, { Component, PureComponent } from 'react';
import { StyleSheet, View, Text, FlatList, } from 'react-native';
import { graphql, compose, withApollo, } from "react-apollo";

// import { withMetadataQuery, } from '../graphql/WithQuery';
// import { withLocalLoginedUserQuery } from '../graphql/WithQuery';
import { QUERY_MORE_FAVORITES } from '../graphql/GQLQuery';
import { PAGI_IMAGE_LIMIT } from '../util/GlobalConst';
import ButtonCommon from '../components/button/ButtonCommon';
import {
  BUTTON_TYPE_MORE, BUTTON_TYPE_SHARE, BUTTON_TYPE_FAVORITE, BUTTON_TYPE_EYE,
} from '../components/button/ButtonConst';
// import { WIDTH_CHILD, } from '../util/DimesionUtil';
// import { ImageFromServerUrl, } from '../components';
// import { SelectedWordsLabelStyle as StyleLabel } from '../components';

// import StyleFavorite,
// {
//   WIDTH_FAVORITE_ITEM, HEIGHT_FAVORITE_ITEM,
//   SCALE_WIDTH_IMAGE, HEIGHT_FAVORITE_WORD,
// } from './ListFavoritesStyle';
import StyleFavorite from './ListFavoritesStyle';
// import FavoriteImageWord from './FavoriteImageWord';
import FavoriteItem from './FavoriteItem';

const _ = require('lodash');

// const WIDTH_FAVORITE_ITEM = WIDTH_CHILD - 10;
// const HEIGHT_FAVORITE_ITEM = 220;
// const HEIGHT_FAVORITE_WORD = 24;

// 收藏列表
class ListFavorites extends Component {

  constructor(props) {
    super(props);
    this.state = {
      hasMore: true,
    };
  }

  onMoreClick = () => {
    this.loadMoreFavoritesList();
  }

  loadMoreFavoritesList = () => {
    if (!this.props.moreFavorites) return;
    const { moreFavorites, fetchMore } = this.props.moreFavorites;
    if (!moreFavorites) return;

    fetchMore({
      variables: {
        offset: moreFavorites.length,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        const more = fetchMoreResult.moreFavorites;
        if (!more || more.length <= 0) {
          this.setState({ hasMore: false });
          return prev;
        }
        const maybeDuplicate = [...prev.moreFavorites, ...fetchMoreResult.moreFavorites];
        const uniqueMoreWords = _.uniqBy(maybeDuplicate, (item) => item.id);

        return Object.assign({}, prev, {
          moreFavorites: uniqueMoreWords,
        });
      }
    });
  }


  renderItem = ({ item }) => {
    const { metadata, loginedUser, } = this.props;
    if (!metadata || !loginedUser || !item) return null;
    // console.log('ListFavorites renderItem: ', metadata);

    return (
      <View style={StyleFavorite.itemFavorite}>
        <FavoriteItem
          metadata={metadata}
          // 此处imageid是给FavoriteItem中withImageQuery()使用的查询参数
          imageid={item.imageid}
          // favoriteContent以前变量名是favorite，与FavoriteItem内的favorite查询重名，因此改名
          favoriteContent={item}
          loginedUser={loginedUser}
        />
      </View>
    );

    // return (
    //   <View style={StyleFavorite.itemFavorite}>
    //     <View style={StyleFavorite.imageWithWord}>
    //       <View style={StyleFavorite.imageFavorite}>
    //         <FavoriteImageWord
    //           id={item.imageid}
    //           metadata={metadata}
    //           word={item.word}
    //         />
    //       </View>
    //     </View>

    //     <View style={StyleFavorite.ctrlFavorite}>
    //       <ButtonCommon type={BUTTON_TYPE_SHARE} onPress={() => { }} />
    //       <ButtonCommon type={BUTTON_TYPE_FAVORITE} onPress={() => { }} />
    //       <ButtonCommon type={BUTTON_TYPE_EYE} onPress={() => { }} />
    //     </View>
    //   </View>
    // );
  }

  render() {
    const { metadata, loginedUser, } = this.props;
    if (!metadata || !loginedUser) return null;
    // if (!this.props.moreFavorites) return this.renderNoFavoriteTitle();
    // const { moreFavorites } = this.props.moreFavorites;
    // if (!moreFavorites || (moreFavorites.length <= 0)) return this.renderNoFavoriteTitle();
    if (!this.props.moreFavorites) return null;
    const { moreFavorites } = this.props.moreFavorites;
    if (!moreFavorites) return null;

    return (
      <View style={styles.container}>
        <Text style={{ color: 'blue' }}>我的收藏列表</Text>

        <View style={styles.favoriteList}>
          <FlatList
            // ref='listImageWordsRef'
            // style={{ flex: 1, }}
            data={moreFavorites}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => item.id}
            // onEndReached={this.onListEndReached}
            onEndReachedThreshold={0.5}
          // onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }}
          // onRefresh={this.onRefresh}
          // refreshing={this.state.refreshing}
          />
        </View>

        <View style={styles.ctrlMoreContainer}>
          {
            this.state.hasMore ?
              <ButtonCommon type={BUTTON_TYPE_MORE}
                onPress={this.onMoreClick}
                // disabled={!this.state.hasMore}
                // text={this.state.hasMore ? "更多收藏" : "没有更多了"}
                text={"更多收藏"}
              /> :
              (<Text>没有更多了</Text>)
          }

        </View>
      </View>
    );
  }
}

export default compose(
  // withApollo,
  // withMetadataQuery(),
  // withLocalLoginedUserQuery(),

  graphql(QUERY_MORE_FAVORITES, {
    name: `moreFavorites`,
    // props: ({ moreImages: { moreImages, error, loading, fetchMore } }) =>
    //   ({ moreImages, error, loading, fetchMore }),
    options: ({ loginedUser, }) => ({
      variables: {
        offset: 0,
        limit: PAGI_IMAGE_LIMIT,
        // operToken: loginedUser ? loginedUser.token : '',
        operToken: loginedUser.token,
      },
      // fetchPolicy 因为用户可能注销或再登录，所以数据要重新获取
      fetchPolicy: 'cache-and-network',
    }),
  }),

)(ListFavorites);

