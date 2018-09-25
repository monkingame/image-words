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


// @2018-07-27 10:17:01 ListWords简版 用来显示前几个的说说
class ListWordsSimple extends Component {

  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     hasMore: true,
  //   };
  // }

  // onMoreClick = () => {
  //   const { startCounter, } = this.props.timeoutCounter;
  //   this.loadMoreWordList();
  //   startCounter();
  // }

  // loadMoreWordList = () => {
  //   const { moreWordsByImageId, fetchMore } = this.props;
  //   if (!moreWordsByImageId) return;

  //   fetchMore({
  //     variables: {
  //       offset: moreWordsByImageId.length,
  //     },
  //     updateQuery: (prev, { fetchMoreResult }) => {
  //       if (!fetchMoreResult) return prev;
  //       const more = fetchMoreResult.moreWordsByImageId;
  //       if (!more || more.length <= 0) {
  //         this.setState({ hasMore: false });
  //         return prev;
  //       }
  //       return Object.assign({}, prev, {
  //         moreWordsByImageId: [...prev.moreWordsByImageId, ...fetchMoreResult.moreWordsByImageId]
  //       });
  //     }
  //   });
  // }


  render() {
    const { moreWordsByImageId, metadata, image } = this.props;
    if (!moreWordsByImageId || !image) return null;
    const { ticking, } = this.props.timeoutCounter;
    // 只取前3个
    const simpleMoreWords = moreWordsByImageId.slice(0, 3);

    //TODO:怎么没有滚动？需要解决
    //可能是嵌套FlatList的原因，如果有必要，就采用Button More的方式
    //或者采用弹出窗口如Modal 或许也可解决
    return (
      <View style={{ flex: 1, }}>
        {/* <View style={styles.selectedWord}>
          <Text style={{ color: '#116622' }}>
            {image.selectedWord}
          </Text>
        </View> */}

        <View style={styles.wordsContainer}>
          <ScrollView style={styles.scrollContainer} >
            {
              simpleMoreWords.map(word => (
                <WordPanel key={word.id} imageid={this.props.imageid} word={word}
                  metadata={metadata}
                  simpleShow={true} />
              ))
            }
          </ScrollView>
        </View>

        {/* <View style={styles.commandsContainer}>
          <ButtonCommon type={BUTTON_TYPE_MORE}
            onPress={this.onMoreClick}
            disabled={!this.state.hasMore || ticking}
            text={this.state.hasMore ? "更多说说" : "没有更多了"} />
        </View> */}

      </View>
    );
  }
}


export default compose(
  withLocalLoginedUserQuery(),

  withImageQuery(),

  withMutImageLocalField('selectedWord'),

  graphql(QUERY_MORE_WORDS_BY_IMAGEID, {
    name: `moreWordsByImageId`,
    props: ({ moreWordsByImageId: { moreWordsByImageId, error, loading, fetchMore } }) =>
      ({ moreWordsByImageId, error, loading, fetchMore }),
    options: ({ imageid }) => ({ variables: { imageid, offset: 0, limit: PAGI_WORDS_LIMIT } }),
  }),
)(withTimeoutCounter(ListWordsSimple, 2));


const styles = StyleSheet.create({
  wordsContainer: {
    flex: 5,
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

