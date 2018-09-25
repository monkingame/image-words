import React, { Component } from 'react';
// import { connect } from 'react-redux';
import { Text, View, FlatList, Button, StyleSheet } from 'react-native';
import { graphql, compose, } from "react-apollo";

// import { searchWordsClose, pageSearchWords } from './actions';
import ResultItem from './ResultItem';
// import { getSearchResultList, hasMoreSearchResult, getSearchPageLast } from './Util';
// import { inBusySearching } from '../status/Util';
import { HEIGHT_BOTTOM_TAB_BAR } from '../util/DimesionUtil';
import { withMutLocalSearchStatus } from '../graphql/WithMutation';
// import { withSearchWordQuery } from '../graphql/WithQuery';
import { QUERY_SEARCH_MORE_WORDS } from '../graphql/GQLQuery';
import { PAGI_SEARCH_LIMIT } from '../util/GlobalConst';
import { withLocalSearchStatusQuery } from '../graphql/WithQuery';

class SearchResultListClickMore extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // mapLastIDSent: {},
      hasMore: true,
    };
  }

  componentWillReceiveProps(nextProps) {
    // const hasMoreOld = this.props.hasMore;
    // const hasMoreNext = nextProps.hasMore;
    // if ((hasMoreOld !== hasMoreNext) && !hasMoreNext) {
    //   //已经没有更多了，清理掉发送过的数据，以备下次
    //   this.setState({ mapLastIDSent: {} });
    // }

    //TODO:注意 对于搜索来说，因为可能会有新的搜索条件输入，所以不应该简单的将按钮设置为灰色，
    // 而是在搜索keyword变化后，重置搜索
    const statusPrev = this.props.searchStatus;
    const statusNext = nextProps.searchStatus;
    let keywordPrev = null;
    let keywordNext = null;
    if (statusPrev) keywordPrev = statusPrev.keyword;
    if (statusNext) keywordNext = statusNext.keyword;
    // console.log('SearchResultListClickMore componentWillReceiveProps: ', keywordPrev, keywordNext);
    if (keywordPrev !== keywordNext) {
      this.setState({ hasMore: true });
    }
  }

  handleClose = async () => {
    const { updateLocalSearchStatus } = this.props;
    await updateLocalSearchStatus({
      variables: {
        searchStatus: {
          keyword: null,
          inSearch: false,
        },
      }
    });
  }

  // requestMorePageOnce = () => {
  //   const { hasMore, pageSearch, last } = this.props;
  //   if (!hasMore) {
  //     return;
  //   };

  //   const { lastid, words } = last;
  //   // console.log('SearchResultListClickMore requestMorePageOnce last: ', last);
  //   if (!words) return;

  //   const { mapLastIDSent } = this.state;
  //   if (!mapLastIDSent[lastid]) {
  //     mapLastIDSent[lastid] = true;
  //     this.setState({ mapLastIDSent }, () => {
  //       pageSearch(words, lastid);
  //     });
  //   }
  // }

  onMoreClick = () => {
    this.loadMoreSearch();
  }

  loadMoreSearch = () => {
    const { searchMoreWords, fetchMore } = this.props;

    fetchMore({
      variables: {
        offset: searchMoreWords.length,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        const more = fetchMoreResult.searchMoreWords;
        if (!more || more.length <= 0) {
          this.setState({ hasMore: false });
          return prev;
        }
        // console.log('onMoreClick : ', fetchMoreResult);

        return Object.assign({}, prev, {
          searchMoreWords: [...prev.searchMoreWords, ...fetchMoreResult.searchMoreWords]
        });
      }
    });
  }

  renderItem = ({ item }) => {
    // console.log('SearchResultListClickMore renderItem: ', item);

    return (
      <View style={{ flex: 1, alignItems: 'center', }}>
        <ResultItem result={item} />
      </View>
    );
  }

  onListEndReached = () => {
    // console.log('SearchResultListClickMore onListEndReached...');
    if (!this.onEndReachedCalledDuringMomentum) {
      this.onEndReachedCalledDuringMomentum = true;
      // console.log('SearchResultListClickMore onListEndReached will request more...');
      // this.requestMorePageOnce();
      this.loadMoreSearch();
    }
  }

  onListMomentumScrollEnd = () => {
    // console.log('SearchResultListClickMore onListMomentumScrollEnd');
  }

  render() {
    // const { listSearch, hasMore } = this.props;
    // console.log('SearchResultListClickMore hasMore: ', hasMore, listSearch);
    const { searchMoreWords } = this.props;
    if (!searchMoreWords) return null;
    // console.log('SearchResultListClickMore searchMoreWords: ', searchMoreWords);

    return (
      <View style={{ flex: 1, backgroundColor: '#dde0dd' }}>
        <View style={{ flexDirection: 'row', height: 30 }}>
          <View style={{ flex: 3, alignItems: 'center', }}>
            <Text>{"搜索结果"}</Text>
          </View>
          <View style={{ flex: 2, alignItems: 'center', }}>
            <Button
              // onPress={() => this.props.close()}
              onPress={this.handleClose}
              title="返回"
            />
          </View>
        </View>

        <View style={{ flex: 6, marginTop: 10 }}>
          <FlatList
            // data={listSearch}
            data={searchMoreWords}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => item.id}
            onEndReached={this.onListEndReached}
            onEndReachedThreshold={0.5}
            onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }}
            onMomentumScrollEnd={this.onListMomentumScrollEnd}
          />
        </View>

        {/* <View style={{ flex: 1, alignItems: 'center', }}>
          {
            this.state.hasMore ?
              <Button
                // onPress={() => this.requestMorePageOnce()}
                onPress={this.onMoreClick}
                title="更多搜索结果"
              />
              : <Text>已到搜索结尾</Text>
          }
        </View> */}
        {
          this.state.hasMore ?
            null :
            (<View style={{ flex: 1, alignItems: 'center', }}>
              <Text>{"已到搜索结尾"}</Text>
            </View>)
        }

        <View style={{ height: HEIGHT_BOTTOM_TAB_BAR, }} />

      </View>
    );
  }
}

// const mapStateToProps = (state, ownProps) => {
//   return {
//     listSearch: getSearchResultList(state),
//     hasMore: hasMoreSearchResult(state),
//     last: getSearchPageLast(state),
//     busySearching: inBusySearching(state),
//   };
// }

// const mapDispatchToProps = (dispatch) => {
//   return {
//     close: () => {
//       dispatch(searchWordsClose());
//     },
//     pageSearch: (words, lastid) => {
//       dispatch(pageSearchWords(words, lastid));
//     },
//   }
// }

// const SearchResultListClickMoreContainer = connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(SearchResultListClickMore)

// export default SearchResultListClickMoreContainer;

export default compose(
  withMutLocalSearchStatus(),
  withLocalSearchStatusQuery(),

  graphql(QUERY_SEARCH_MORE_WORDS, {
    name: `searchMoreWords`,
    props: ({ searchMoreWords: { searchMoreWords, error, loading, fetchMore } }) =>
      ({ searchMoreWords, error, loading, fetchMore }),
    options: ({ keyword }) => ({ variables: { keyword, offset: 0, limit: PAGI_SEARCH_LIMIT } }),
  }),

)(SearchResultListClickMore);

