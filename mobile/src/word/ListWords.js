import React, { Component } from 'react';
// import { connect } from 'react-redux';
import { Text, View, FlatList, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { graphql, compose, } from "react-apollo";

// import { getWordsList, getWordsPageLast, hasMorePages } from './Util';
// import { pageWords } from './actions';
import ButtonCommon from '../components/button/ButtonCommon';
import { BUTTON_TYPE_MORE } from '../components/button/ButtonConst';

import { QUERY_IMAGE, QUERY_MORE_WORDS_BY_IMAGEID } from '../graphql/GQLQuery';
import { withMutImageLocalField } from '../graphql/WithMutation';
import { PAGI_WORDS_LIMIT } from '../util/GlobalConst';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';
import withTimeoutCounter from '../hoc/HOCTimeoutCounter';
import { withImageQuery } from '../graphql/WithQuery';
import WordPanel from './WordPanel';

const _ = require('lodash');


class ListWords extends Component {

  constructor(props) {
    super(props);
    this.state = {
      // loading: false,
      // mapLastIDSent: {},
      hasMore: true,
    };
  }

  // componentDidMount() {
  //   //NOTE:在ImageWords里面已经拉取一次了

  //   // const { listwords } = this.props;
  //   // if (!listwords || listwords.length <= 0) {
  //   //   //说明上次已经拉取过数据了，这次是被其他页面刷新导致的重载入
  //   //   this.requestPageOnce(this.props.imageid);
  //   // }
  // }

  // //NOTE:注意：words表是按照vote和id同时排列的，详见数据库结构
  // requestPageOnce = (imageid, lastid, lastvote) => {
  //   // console.log('WordsList requestPageOnce');
  //   if (!this.props.hasMore) {
  //     return;
  //   }
  //   const request = this.props.pageWordsFunc;
  //   if (!lastid) {
  //     //第一次发送请求
  //     //NOTE:不能用lastvote再判断，因为lastvote可能为0，会被js判断false
  //     request(imageid);
  //     return;
  //   }
  //   if (!this.state.mapLastIDSent[lastid]) {
  //     //防止多次滚动（数据库数据还未返回时，滚动事件持续进行）
  //     this.setState({ mapLastIDSent: { [lastid]: true } }, () => {
  //       request(imageid, lastid, lastvote);
  //     });
  //   }
  // }

  // loadMore = () => {
  //   const { last } = this.props;
  //   if (last) {
  //     const { lastid, lastvote } = last;
  //     this.requestPageOnce(this.props.imageid, lastid, lastvote);
  //   }
  // }

  // componentWillReceiveProps(nextProps) {
  //   const { imageid, moreWordsByImageId, image, updateImageLocalSelectedWord } = nextProps;
  //   console.log('ListWords componentWillReceiveProps:', imageid, moreWordsByImageId, image, );
  //   if (!imageid || !moreWordsByImageId || !image) return;
  //   //默认第一条说说选中
  //   const { selectedWord } = image;
  //   if (!selectedWord && moreWordsByImageId.length > 0) {
  //     updateImageLocalSelectedWord({
  //       variables: {
  //         id: imageid,
  //         selectedWord: moreWordsByImageId[0].content,
  //       }
  //     });
  //   }
  // }

  onMoreClick = () => {
    const { startCounter, } = this.props.timeoutCounter;
    this.loadMoreWordList();
    startCounter();
  }

  // TODO: 注意 这里出现了重复现象
  // 如果别的用户发表了一条说说，然后点击更多，结果就出现了重复key
  // 因为是按照page limit获取的（数据有排序，因此排名第一位的可能又被获取到），所以可能出现重复现象
  // 只要排除重复的即可
  // 更彻底的办法是换用游标
  loadMoreWordList = () => {
    const { moreWordsByImageId, fetchMore } = this.props;
    if (!moreWordsByImageId) return;

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
        // console.log('ListWords fetchMore: ', prev.moreWordsByImageId, more);
        const maybeDuplicate = [...prev.moreWordsByImageId, ...fetchMoreResult.moreWordsByImageId];
        const uniqueMoreWords = _.uniqBy(maybeDuplicate, (item) => item.id);
        // console.log('ListWords fetchMore uniqueMoreWords: ', uniqueMoreWords);

        return Object.assign({}, prev, {
          // moreWordsByImageId: [...prev.moreWordsByImageId, ...fetchMoreResult.moreWordsByImageId],
          moreWordsByImageId: uniqueMoreWords,
        });
      }
    });
  }


  // onListEndReached = () => {
  //   if (!this.onEndReachedCalledDuringMomentum) {
  //     this.onEndReachedCalledDuringMomentum = true;
  //     const { last } = this.props;
  //     if (last) {
  //       const { lastid, lastvote } = last;
  //       // console.log('WordsList onListEndReached will occure ....');
  //       this.requestPageOnce(this.props.imageid, lastid, lastvote);
  //     }
  //   }
  // }

  render() {
    const { moreWordsByImageId, metadata, image } = this.props;
    if (!moreWordsByImageId || !image) return null;
    const { ticking, } = this.props.timeoutCounter;
    // console.log('ListWords words: ', moreWordsByImageId);

    // const { listwords, hasMore } = this.props;
    // if (!listwords) return null;
    // console.log(listwords.length);

    //TODO:怎么没有滚动？需要解决
    //可能是嵌套FlatList的原因，如果有必要，就采用Button More的方式
    //或者采用弹出窗口如Modal 或许也可解决
    return (
      // <View style={{ height: 120, }}>
      //   <FlatList
      //     data={listwords}
      //     renderItem={this.renderItem}
      //     keyExtractor={(item, index) => item._id}
      //     onEndReached={this.onListEndReached}
      //     onEndReachedThreshold={0.5}
      //     onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }}
      //   />
      // </View>
      <View style={{ flex: 1, }}>
        <View style={styles.selectedWord}>
          <Text style={{ color: '#116622' }}>
            {image.selectedWord}
          </Text>
        </View>

        <View style={styles.wordsContainer}>
          <ScrollView style={styles.scrollContainer} >
            {
              moreWordsByImageId.map(word => (
                <WordPanel key={word.id} imageid={this.props.imageid} word={word} metadata={metadata} />
              ))
            }
          </ScrollView>
        </View>

        <View style={styles.commandsContainer}>
          <ButtonCommon type={BUTTON_TYPE_MORE}
            onPress={this.onMoreClick}
            disabled={!this.state.hasMore || ticking}
            text={this.state.hasMore ? "更多说说" : "没有更多了"} />
        </View>

      </View>
    );
  }
}


// export default ListWords;
export default compose(
  withLocalLoginedUserQuery(),

  // graphql(QUERY_IMAGE, {
  //   name: `image`,
  //   props: ({ image: { image, error, loading } }) => ({ image, error, loading }),
  //   options: ({ imageid, metadata }) => ({ variables: { id: imageid, metadata } }),
  // }),
  withImageQuery(),

  withMutImageLocalField('selectedWord'),

  graphql(QUERY_MORE_WORDS_BY_IMAGEID, {
    name: `moreWordsByImageId`,
    props: ({ moreWordsByImageId: { moreWordsByImageId, error, loading, fetchMore } }) =>
      ({ moreWordsByImageId, error, loading, fetchMore }),
    options: ({ imageid }) => ({ variables: { imageid, offset: 0, limit: PAGI_WORDS_LIMIT } }),
  }),
)(withTimeoutCounter(ListWords, 2));


const styles = StyleSheet.create({
  wordsContainer: {
    flex: 5,
    // backgroundColor: '#ddeeff',
  },
  selectedWord: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  commandsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 40,
    marginVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#AAAADC',
    // height: 100,
  },
})

