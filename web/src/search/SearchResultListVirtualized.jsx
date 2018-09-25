import React, { Component } from 'react';
// import { connect } from 'react-redux';
// import { Button, Row, Col, Card, message, List } from 'antd';
import { message, List } from 'antd';
import 'antd/dist/antd.css';
import WindowScroller from 'react-virtualized/dist/commonjs/WindowScroller';
import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import VList from 'react-virtualized/dist/commonjs/List';
import InfiniteLoader from 'react-virtualized/dist/commonjs/InfiniteLoader';

import { searchWordsClose, pageSearchWords } from './actions';
import ResultItem from './ResultItem';
// import { REDUCER_SEARCH } from './reducer';
import { getSearchResultList, hasMoreSearchResult, getSearchPageLast, ifSearchReturned } from './Util';
import './search.css'

// import TestResult from './TestResult';

class SearchResultListVirtualized extends Component {
  state = {
    // data: [],
    // loading: false,
    hasMore: true,
    mapLastIDSent: {},
  }
  loadedRowsMap = {};

  // 到这步时，Search按钮已经执行了一次搜索，所以现在至少是第二页搜索，不用再判断是否是首次
  requestPageOnce = () => {
    const { hasMore, pageSearch, last } = this.props;
    console.log("requestPageOnce hasMore? ", hasMore);
    if (!hasMore) return;

    const { lastid, words } = last;
    if (!this.state.mapLastIDSent[lastid]) {
      //防止多次滚动（数据库数据还未返回时，滚动事件持续进行）
      this.setState({ mapLastIDSent: { [lastid]: true } }, () => {
        // request(imageid, lastid, lastvote);
        pageSearch(words, lastid);
        // console.log("requestPageOnce: ",words,lastid);
      });
    }
  }

  handleInfiniteOnLoad = ({ startIndex, stopIndex }) => {
    for (let i = startIndex; i <= stopIndex; i++) {
      this.loadedRowsMap[i] = 1;
    }

    const { hasMore } = this.props;
    // console.log("handleInfiniteOnLoad hasMore: ",hasMore);
    // this.setState({ hasMore: !!last });
    this.setState({ hasMore });
    // if (!last) return;
    if (!hasMore) {
      message.warning('搜索结束');
      // this.setState({
      //   loading: false,
      // });
      return;
    }

    // if (last) {
    // const { lastid, lastvote } = last;
    this.requestPageOnce();
    // }
  }

  // handleInfiniteOnLoad = ({ startIndex, stopIndex }) => {
  //   // let data = this.state.data;
  //   // this.setState({
  //   //   loading: true,
  //   // });
  //   for (let i = startIndex; i <= stopIndex; i++) {
  //     this.loadedRowsMap[i] = 1;
  //   }

  //   // if (data.length > LENGTH_TEST) {
  //   //   message.warning('列表结束');
  //   //   // console.log('列表结束');
  //   //   this.setState({
  //   //     loading: false,
  //   //   });
  //   //   return;
  //   // }

  //   this.getData((res) => {
  //     data = data.concat(res.results);
  //     this.setState({
  //       data,
  //       loading: false,
  //     });
  //   });
  // }


  isRowLoaded = ({ index }) => {
    // console.log(index, this.loadedRowsMap[index]);
    return !!this.loadedRowsMap[index];
  }

  renderItem = ({ index, key, style }) => {
    const { listSearch } = this.props;
    const item = listSearch[index];
    return (
      <List.Item key={key} style={style}>
        {/* <List.Item.Meta
          title={`${item.name.first}-${item.name.last}`}
        /> */}
        {/* <div> <ResultItem result={item} /></div> */}
        <ResultItem result={item} />
        {/* <TestResult /> */}
      </List.Item>
    );
  }


  render() {
    const { listSearch, searchReturned } = this.props;
    if (!listSearch) return null;
    if (!searchReturned) return null;
    // console.log("SearchResultListVirtualized length: ", listSearch.length);

    // return (
    //   <div>
    //     <Row>
    //       <Col span={2} offset={20}>
    //         <Button type="danger" icon="close-circle-o" onClick={() => this.props.close()}>{"返回"}</Button>
    //       </Col>
    //     </Row>

    //     <Row>
    //       <Card title="搜索结果">
    //         {
    //           listSearch.map((item) => (
    //             <ul key={item._id} >
    //               <Card.Grid className="search-card">
    //                 <ResultItem result={item} />
    //               </Card.Grid>
    //             </ul>
    //           ))
    //         }
    //       </Card>

    //     </Row>
    //   </div>
    // );

    const vlist = ({ height, isScrolling, onChildScroll, scrollTop, onRowsRendered, width }) => {
      // console.log("vlist: ", width, height);
      return (
        <VList
          autoHeight
          height={height}
          isScrolling={isScrolling}
          onScroll={onChildScroll}
          overscanRowCount={2}
          rowCount={listSearch.length}
          rowHeight={500}
          rowRenderer={this.renderItem}
          onRowsRendered={onRowsRendered}
          scrollTop={scrollTop}
          width={width}
        />
      );
    }

    const autoSize = ({ height, isScrolling, onChildScroll, scrollTop, onRowsRendered }) => {
      // console.log("autoSize: ", height, isScrolling, scrollTop);
      return (
        <AutoSizer disableHeight>
          {({ width }) => vlist({ height, isScrolling, onChildScroll, scrollTop, onRowsRendered, width })}
        </AutoSizer>
      );
    }

    const infiniteLoader = ({ height, isScrolling, onChildScroll, scrollTop }) => {
      // console.log("infiniteLoader: ", height, isScrolling, scrollTop);
      return (
        <InfiniteLoader
          isRowLoaded={this.isRowLoaded}
          loadMoreRows={this.handleInfiniteOnLoad}
          rowCount={listSearch.length}
        >
          {({ onRowsRendered }) => autoSize({ height, isScrolling, onChildScroll, scrollTop, onRowsRendered })}
        </InfiniteLoader>
      );
    }

    return (
      <List>
        {
          listSearch.length > 0 && (
            <WindowScroller>
              {infiniteLoader}
            </WindowScroller>
          )
        }
        {/* {this.state.loading && <Spin className="demo-loading" />} */}
      </List>
    );
  }
}

// const mapStateToProps = (state, ownProps) => {
//   return {
//     // listSearch: state[REDUCER_SEARCH],
//     listSearch: getSearchResultList(state),
//     hasMore: hasMoreSearchResult(state),
//     last: getSearchPageLast(state),
//     searchReturned: ifSearchReturned(state),
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


// const SearchResultListVirtualizedContainer = connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(SearchResultListVirtualized)

// export default SearchResultListVirtualizedContainer;
export default SearchResultListVirtualized;

