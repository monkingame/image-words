//NOTE:mobile migrate DONE
import React, { Component } from 'react';
// import { connect } from 'react-redux';
import { View, StyleSheet } from 'react-native';
import { compose, withApollo, } from "react-apollo";

// import { pageRefreshList, refreshListStarted } from './actions';
import { ButtonCommon } from '../components/button';
import { BUTTON_TYPE_REFRESH } from '../components/button';
import withTimeoutCounter from '../hoc/HOCTimeoutCounter';
import { QUERY_MORE_IMAGES } from '../graphql/GQLQuery';
import { PAGI_IMAGE_LIMIT } from '../util/GlobalConst';
import { refreshNewMoreImages } from './Util';

const _ = require('lodash');


// TODO: 备份 @2018-06-05 05:51:32 ， 准备切换master分支并合并。
class Refresh extends Component {

  handleRefresh = async () => {
    const { startCounter, } = this.props.timeoutCounter;

    // TODO: 以下注释的是原代码 现已经提取为一个独立函数
    // const { client, } = this.props;

    // const { data } = await client.query({
    //   query: QUERY_MORE_IMAGES,
    //   variables: {
    //     offset: 0,
    //     limit: PAGI_IMAGE_LIMIT,
    //   },
    //   fetchPolicy: 'no-cache',
    // });
    // const { moreImages } = data;
    // if (!moreImages || moreImages.length <= 0) return;

    // const cache = client.readQuery({ query: QUERY_MORE_IMAGES });
    // const difference = _.difference(
    //   moreImages.map(iw => iw.id),
    //   cache.moreImages.map(iw => iw.id)
    // );
    // if (difference.length === 0) return;

    // // 将新出现的列出来
    // const newMoreToAdd = moreImages.filter(
    //   (ele) => (difference.join(',').indexOf(ele.id) >= 0)
    // );
    // if (newMoreToAdd.length === 0) return;

    // cache.moreImages.unshift(...newMoreToAdd);
    // client.writeQuery({ query: QUERY_MORE_IMAGES, data: cache });

    const newMore = await refreshNewMoreImages(this.props.client);
    // console.log('Refresh newMore: ', newMore);

    startCounter();
  }

  render() {
    const { ticking, } = this.props.timeoutCounter;

    return (
      <View style={styles.container}>
        <ButtonCommon
          type={BUTTON_TYPE_REFRESH}
          onPress={this.handleRefresh}
          disabled={ticking}
        />
      </View>
    );
  }
}



// export default Refresh;
export default compose(
  withApollo,
)(withTimeoutCounter(Refresh));


const styles = StyleSheet.create({
  //TODO:这里的flex到底有何用？
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
})

