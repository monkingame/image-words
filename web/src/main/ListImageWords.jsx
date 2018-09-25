import React, { Component } from 'react';
import { Button, Row, List } from 'antd';
import 'antd/dist/antd.css';
import { graphql, compose, withApollo, } from "react-apollo";
import {
  // RecyclerListView,
  DataProvider,
  LayoutProvider,
} from 'recyclerlistview/web';

import ImageWords from './ImageWords';
import { QUERY_MORE_IMAGES } from '../graphql/GQLQuery';
import { PAGI_IMAGE_LIMIT } from '../util/GlobalConst';

import './main.css';

const WIDTH_WINDOW_SCROLLBAR = 17;

class ListImageWords extends Component {

  constructor(props) {
    super(props);

    const dataProvider = new DataProvider((r1, r2) => {
      return r1 !== r2;
    });

    this.layoutProvider = new LayoutProvider(
      index => 1,
      (type, dim) => {
        const { innerWidth, innerHeight } = window;
        // console.log('ListImageWords layoutProvider: ', innerWidth, innerHeight);
        dim.width = (innerWidth - WIDTH_WINDOW_SCROLLBAR) * 2 / 3;
        dim.height = innerHeight;
        // dim.width = 1000;
        // dim.height = 660;
      },
    );
    // console.log('ListImageWords layoutProvider2: ', this.layoutProvider.width);
    // console.log('ListImageWords layoutProvider: ', window.innerWidth, window.innerHeight);

    this.state = {
      hasMore: true,
      dataProvider: dataProvider.cloneWithRows([]),
      // layoutProvider: new LayoutProvider(
      //   index => 1,
      //   (type, dim) => {
      //     dim.width = 1000;
      //     dim.height = 660;
      //   },
      // ),
    };
  }

  componentWillReceiveProps(nextProps) {
    const { moreImages } = nextProps;
    if (!moreImages) return;

    const dataProvider = new DataProvider((r1, r2) => {
      return r1 !== r2;
    });
    this.setState({ dataProvider: dataProvider.cloneWithRows(moreImages) });
  }

  renderRow = (type, data) => {
    return (
      // <div className="div-words-item">
      <ImageWords id={data.id} />
      // </div>
    )
  };


  onMoreClick = (e) => {
    e.preventDefault();
    this.loadMoreImageWord();
  }

  loadMoreImageWord = () => {
    const { moreImages, fetchMore } = this.props;
    if (!moreImages || !fetchMore) return;

    fetchMore({
      variables: {
        offset: moreImages.length,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        const more = fetchMoreResult.moreImages;
        if (!more || more.length <= 0) {
          this.setState({ hasMore: false });
          return prev;
        }

        return Object.assign({}, prev, {
          moreImages: [...prev.moreImages, ...fetchMoreResult.moreImages]
        });
      }
    });
  }

  handleListEnd = () => {
    if (!this.state.hasMore) return;
    this.loadMoreImageWord();
  }

  render() {
    const { moreImages } = this.props;
    if (!moreImages) return null;
    // console.log('ListImageWords moreImages: ', moreImages);

    // TODO:如果使用RecyclerListView，那么div必须有尺寸，也就是className="list-imagewords-panel"，
    // 否则会出现layoutProvider尺寸为0的错误。
    // 但动态调整尺寸会非常麻烦，暂时用按钮实现替翻页。
    return (
      // <div className="list-imagewords-panel">
      <div>
        <List
          dataSource={moreImages}
          renderItem={image =>
            <List.Item key={image.id}>
              <ImageWords id={image.id} />
            </List.Item>
          }
        >
        </List>

        {/* <RecyclerListView
          layoutProvider={this.layoutProvider}
          dataProvider={this.state.dataProvider}
          rowRenderer={this.renderRow}
          canChangeSize
          useWindowScroll
          onEndReached={this.handleListEnd}
        /> */}

        <Row>
          <Button onClick={this.onMoreClick} disabled={!this.state.hasMore}>
            {this.state.hasMore ? "更多看图说说" : "没有更多了"}
          </Button>
        </Row>
      </div>
    );
  }
}


export default compose(
  withApollo,

  graphql(QUERY_MORE_IMAGES, {
    name: `moreImages`,
    props: ({ moreImages: { moreImages, error, loading, fetchMore } }) =>
      ({ moreImages, error, loading, fetchMore }),
    options: () => ({ variables: { offset: 0, limit: PAGI_IMAGE_LIMIT } }),
  }),
)(ListImageWords);

