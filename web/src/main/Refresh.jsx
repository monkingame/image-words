import React, { Component } from 'react';
// import { connect } from 'react-redux';
// import { postRefreshWordsList, refreshList } from './actions';
import { Button } from 'antd';
import 'antd/dist/antd.css';
// import { graphql, compose, withApollo, } from "react-apollo";
import { compose, withApollo, } from "react-apollo";

import withTimeoutCounter from '../hoc/HOCTimeoutCounter';
// const FormItem = Form.Item;
import { QUERY_MORE_IMAGES } from '../graphql/GQLQuery';
import { PAGI_IMAGE_LIMIT } from '../util/GlobalConst';

// import { refreshList } from './actions';
// import { pageRefreshList, refreshListStarted } from './actions';
const _ = require('lodash');


class Refresh extends Component {

  handleSubmit = async (e) => {
    e.preventDefault();
    // resetStore似乎有问题
    // await client.resetStore();

    //TODO:在获取数据之前就禁止按钮
    const { startCounter, } = this.props.timeoutCounter;

    // const { client, refetch, fetchMore, } = this.props;
    // const { client, refetch, } = this.props;
    // refetch();
    // return;

    const { client, } = this.props;

    const { data } = await client.query({
      query: QUERY_MORE_IMAGES,
      variables: {
        offset: 0,
        limit: PAGI_IMAGE_LIMIT,
      },
      fetchPolicy: 'no-cache',
    });
    const { moreImages } = data;
    if (!moreImages || moreImages.length <= 0) return;

    const cache = client.readQuery({ query: QUERY_MORE_IMAGES });
    // const imagesInCache = cache.moreImages;

    // console.log('Refresh data cache: ', cache);
    // const moreIDs = moreImages.map(iw => iw.id);
    // const prevIDs = imagesInCache.map(iw => iw.id);
    // const prevIDs = cache.moreImages.map(iw => iw.id);

    // const difference = _.difference(moreIDs, prevIDs);
    const difference = _.difference(
      moreImages.map(iw => iw.id),
      cache.moreImages.map(iw => iw.id)
    );
    // console.log('Refresh data difference: ', difference, );
    if (difference.length === 0) return;

    // 将新出现的列出来
    // const newIDString = difference.join(',');
    // const newMoreToAdd = moreImages.filter((ele) => (newIDString.indexOf(ele.id) >= 0));
    const newMoreToAdd = moreImages.filter(
      (ele) => (difference.join(',').indexOf(ele.id) >= 0)
    );
    // console.log('Refresh newMoreToAdd: ', newMoreToAdd);
    if (newMoreToAdd.length === 0) return;

    cache.moreImages.unshift(...newMoreToAdd);
    // console.log('Refresh data test : ', cache, );

    client.writeQuery({ query: QUERY_MORE_IMAGES, data: cache });
    // console.log('Refresh cache now is : ', cache);

    // const data = proxy.readQuery({ query: QUERY_MORE_IMAGES });
    // data.moreImages.unshift(addImage);//or push item to the end
    // proxy.writeQuery({ query: QUERY_MORE_IMAGES, data });

    // // NOTE: refetch会全部更新pagination数据，比如，已经取回了10页，那么refetch会将数据重置为1页
    // refetch();

    // fetchMore({
    //   variables: {
    //     offset: 0,
    //     limit: PAGI_IMAGE_LIMIT,
    //   },
    //   updateQuery: (prev, { fetchMoreResult }) => {
    //     if (!fetchMoreResult) return prev;
    //     const more = fetchMoreResult.moreImages;
    //     // if (!more || more.length <= 0) {
    //     //   return prev;
    //     // }
    //     console.log('Refresh updateQuery : ', more);
    //     // return Object.assign({}, prev, {
    //     //   moreImages: [...prev.moreImages, ...fetchMoreResult.moreImages]
    //     // });
    //     return prev;
    //   }
    // });

    startCounter();
  }

  render() {
    const { counterStr, ticking, } = this.props.timeoutCounter;
    // console.log('Refresh counter: ', timeoutCounter, isTimerRunning);
    // console.log('Refresh counter: ', this.props);
    // const strCounter = ticking ? `${counter}` : '';

    return (
      <div style={{ paddingTop: "0px" }}>
        <form onSubmit={this.handleSubmit}>
          <Button htmlType="submit" disabled={ticking}>
            {`刷新${counterStr}`}
          </Button>
        </form>

      </div>
    );
  }
}


// export default Refresh;

// export default compose(
//   withApollo,
// )(Refresh);

export default compose(
  withApollo,

  // graphql(QUERY_MORE_IMAGES, {
  //   name: `moreImages`,
  //   props: ({ moreImages: { moreImages, error, loading, fetchMore, refetch } }) =>
  //     ({ moreImages, error, loading, fetchMore, refetch }),
  //   options: () => ({
  //     variables: { offset: 0, limit: PAGI_IMAGE_LIMIT },
  //     // fetchPolicy: 'cache-and-network',
  //   }),
  // }),

)(withTimeoutCounter(Refresh));

