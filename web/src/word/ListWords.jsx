import React, { Component } from 'react';
// import { List, Button, } from 'antd';
import { Button, } from 'antd';
import 'antd/dist/antd.css';
import { graphql, compose, } from "react-apollo";
// import { Dimensions, View, StyleSheet } from 'react-native-web';
// import { Dimensions, } from 'react-native-web';
import { RecyclerListView, DataProvider, LayoutProvider, } from 'recyclerlistview/web';

import WordPanel from './WordPanel';
import { QUERY_IMAGE, QUERY_MORE_WORDS_BY_IMAGEID } from '../graphql/GQLQuery';
import { withMutImageLocalField } from '../graphql/WithMutation';
import { PAGI_WORDS_LIMIT } from '../util/GlobalConst';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';
import withTimeoutCounter from '../hoc/HOCTimeoutCounter';
import './words.css';


const WIDTH_WINDOW_SCROLLBAR = 17;

class ListWords extends Component {

  constructor(props) {
    super(props);

    const dataProvider = new DataProvider((r1, r2) => {
      return r1 !== r2;
    });

    this.layoutProvider = new LayoutProvider(
      index => 1,
      (type, dim) => {
        const { innerWidth, } = window;
        dim.width = (innerWidth - WIDTH_WINDOW_SCROLLBAR) * 2 / 3 / 3;
        dim.height = 50;
      },
    );

    this.state = {
      hasMore: true,
      dataProvider: dataProvider.cloneWithRows([]),
    };
  }

  componentWillReceiveProps(nextProps) {
    const { imageid, moreWordsByImageId, image, updateImageLocalSelectedWord } = nextProps;
    if (!imageid || !moreWordsByImageId || !image) return;
    //默认第一条说说选中
    const { selectedWord } = image;
    if (!selectedWord && moreWordsByImageId.length > 0) {
      updateImageLocalSelectedWord({
        variables: {
          id: imageid,
          selectedWord: moreWordsByImageId[0].content,
        }
      });
    }

    const dataProvider = new DataProvider((r1, r2) => {
      return r1 !== r2;
    });
    this.setState({ dataProvider: dataProvider.cloneWithRows(moreWordsByImageId) });
  }

  onMoreClick = (e) => {
    e.preventDefault();
    const { startCounter, } = this.props.timeoutCounter;
    this.loadMoreWordList();
    startCounter();
  }

  loadMoreWordList = () => {
    const { imageid, moreWordsByImageId, image, fetchMore } = this.props;
    if (!imageid || !moreWordsByImageId || !image) return;

    fetchMore({
      variables: {
        offset: moreWordsByImageId.length,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        const more = fetchMoreResult.moreWordsByImageId;
        if (!more || more.length <= 0) {
          this.setState({ hasMore: false });
          return prev;
        }
        return Object.assign({}, prev, {
          moreWordsByImageId: [...prev.moreWordsByImageId, ...fetchMoreResult.moreWordsByImageId]
        });
      }
    });
  }

  renderRow = (type, data) => {
    return (
      <div className="div-words-item">
        <WordPanel imageid={this.props.imageid} word={data} />
      </div>
    )
  };

  handleListEnd = () => {
    // console.log('WordsList handleListEnd');
    if (!this.state.hasMore) return;
    this.loadMoreWordList();
  }

  render() {
    const { moreWordsByImageId } = this.props;
    if (!moreWordsByImageId) return null;
    const { ticking, } = this.props.timeoutCounter;

    return (
      <div>

        <div className="div-words-list">
          {/* <List
            dataSource={moreWordsByImageId}
            renderItem={word =>
              <List.Item key={word.id}>
                <div className="div-words-item">
                  <WordPanel imageid={imageid} word={word} />
                </div>
              </List.Item>
            }
          /> */}
          <RecyclerListView
            layoutProvider={this.layoutProvider}
            dataProvider={this.state.dataProvider}
            rowRenderer={this.renderRow}
            canChangeSize
            // useWindowScroll
            onEndReached={this.handleListEnd}
          />
        </div>

        <Button onClick={this.onMoreClick}
          disabled={!this.state.hasMore || ticking}
          size={"small"}>
          {this.state.hasMore ? "更多说说" : "没有更多了"}
        </Button>
      </div>
    );
  }

}



export default compose(
  withLocalLoginedUserQuery(),

  graphql(QUERY_IMAGE, {
    name: `image`,
    props: ({ image: { image, error, loading } }) => ({ image, error, loading }),
    options: ({ imageid }) => ({ variables: { id: imageid } }),
  }),
  withMutImageLocalField('selectedWord'),

  graphql(QUERY_MORE_WORDS_BY_IMAGEID, {
    name: `moreWordsByImageId`,
    props: ({ moreWordsByImageId: { moreWordsByImageId, error, loading, fetchMore } }) =>
      ({ moreWordsByImageId, error, loading, fetchMore }),
    options: ({ imageid }) => ({ variables: { imageid, offset: 0, limit: PAGI_WORDS_LIMIT } }),
  }),

)(withTimeoutCounter(ListWords, 2));

