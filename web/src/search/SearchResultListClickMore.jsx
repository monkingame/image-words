import React, { Component } from 'react';
// import { connect } from 'react-redux';
// import { Button, Row, Col, Card, message, List ,Spin } from 'antd';
import { Button, Row, Col, Card, } from 'antd';
import 'antd/dist/antd.css';
import { graphql, compose, } from "react-apollo";

// import { searchWordsClose, pageSearchWords } from './actions';
import ResultItem from './ResultItem';
// import { REDUCER_SEARCH } from './reducer';
// import { getSearchResultList, hasMoreSearchResult, getSearchPageLast } from './Util';
// import { inBusySearching } from '../status/Util';
import './search.css'
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
    //   //已经没有更多了，清理掉发送过的数据，以备下次新搜索
    //   this.setState({ mapLastIDSent: {} });
    // }
    // const{keyword}
    // const { searchStatus } = nextProps;
    // console.log('SearchResultListClickMore componentWillReceiveProps: ', searchStatus);

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


  // // 到这步时，Search按钮已经执行了一次搜索，所以现在至少是第二页搜索，不用再判断是否是首次
  // requestPageOnce = () => {
  //   const { hasMore, pageSearch, last } = this.props;
  //   if (!hasMore) {
  //     return;
  //   };

  //   const { lastid, words } = last;
  //   const { mapLastIDSent } = this.state;
  //   if (!mapLastIDSent[lastid]) {
  //     //防止多次滚动（数据库数据还未返回时，滚动事件持续进行）
  //     mapLastIDSent[lastid] = true;
  //     this.setState({ mapLastIDSent }, () => {
  //       pageSearch(words, lastid);
  //     });
  //   }
  // }

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

  onMoreClick = (e) => {
    e.preventDefault();
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

  render() {
    // const { listSearch, hasMore } = this.props;
    // if (!listSearch) return null;

    // const { searchWords } = this.props;
    // if (!searchWords) return null;

    const { searchMoreWords } = this.props;
    if (!searchMoreWords) return null;
    // console.log('SearchResultListClickMore searchWords: ', searchWords);

    return (
      <div>
        <Row>
          <Col span={2} offset={20}>
            {/* <Button type="danger" icon="close-circle-o" onClick={() => this.props.close()}> */}
            <Button type="danger" icon="close-circle-o" onClick={() => this.handleClose()}>
              {"返回"}
            </Button>
          </Col>
        </Row>

        <Row>
          <Card title="搜索结果">
            {
              searchMoreWords.map((item) => (
                <ul key={item.id} >
                  <Card.Grid className="search-card">
                    <ResultItem result={item} />
                  </Card.Grid>
                </ul>
              ))
            }
          </Card>
        </Row>

        <Row>
          {/* {
            hasMore ?
              <Spin spinning={this.state.hasMore}>
                <Button onClick={() => this.requestPageOnce()}>{"加载更多"}</Button>
              </Spin>
              : "已到搜索结尾"
          } */}
          {/* <Spin spinning={this.state.hasMore}> */}
          <Button onClick={this.onMoreClick}
            disabled={!this.state.hasMore}
          >
            {this.state.hasMore ? "更多搜索结果" : "没有更多了"}
          </Button>
          {/* </Spin> */}
        </Row>
      </div>
    );

  }
}

// const mapStateToProps = (state, ownProps) => {
//   return {
//     listSearch: getSearchResultList(state),
//     hasMore: hasMoreSearchResult(state),
//     last: getSearchPageLast(state),
//     busySearching: inBusySearching(state),
//     // searchReturned: ifSearchReturned(state),
//     // newSearch: newSearchStarted(state),
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
  // withApollo,
  withMutLocalSearchStatus(),
  // withSearchWordQuery(),
  withLocalSearchStatusQuery(),

  graphql(QUERY_SEARCH_MORE_WORDS, {
    name: `searchMoreWords`,
    props: ({ searchMoreWords: { searchMoreWords, error, loading, fetchMore } }) =>
      ({ searchMoreWords, error, loading, fetchMore }),
    options: ({ keyword }) => ({ variables: { keyword, offset: 0, limit: PAGI_SEARCH_LIMIT } }),
  }),

)(SearchResultListClickMore);

