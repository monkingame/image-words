import React, { Component } from 'react';
// import { connect } from 'react-redux';
import { Text, TouchableOpacity, } from 'react-native';
import { graphql, compose, } from "react-apollo";

// import { exportImageSuccess } from '../export/actions';
import { withMutImageLocalField } from '../graphql/WithMutation';
import {
  withImageQuery,
  // withVisibleModalListWordsQuery,
} from '../graphql/WithQuery';
// import { withMutVisibleModalListWords } from '../graphql/WithMutation';

// import { ButtonCommon, } from '../components/button';

class WordLabel extends Component {

  onClickLabel = async () => {
    await this.selectImageWord();

    // this.showModalListWords(false);
  }

  selectImageWord = async () => {
    const {
      imageid, content, image,
      updateImageLocalSelectedWord,
    } = this.props;

    if (!image) return;
    await updateImageLocalSelectedWord({
      variables: {
        id: imageid,
        selectedWord: content,
      }
    });
  }

  // showModalListWords = (visible) => {
  //   const { updateVisibleModalListWords, } = this.props;
  //   updateVisibleModalListWords({
  //     variables: {
  //       visible,
  //     }
  //   });
  // }

  render() {
    // const { words } = this.props;
    const { content, } = this.props;
    if (!content) return null;

    // console.log('WordLabel visibleModalListWords: ', visibleModalListWords);

    return (
      // <View style={{ flex: 1, }}>
      // TODO: 替换为ButtonCommon

      // <TouchableHighlight onPress={this.onClickLabel}>
      //   <Text>{content}</Text>
      // </TouchableHighlight>

      <TouchableOpacity onPress={this.onClickLabel}>
        <Text>{content}</Text>
      </TouchableOpacity>

      // <ButtonCommon
      //   onPress={this.onClickLabel}
      //   text={content} />

      // </View>
    );
  }
}



export default compose(
  // graphql(QUERY_IMAGE, {
  //   name: `image`,
  //   props: ({ image: { image, error, loading } }) => ({ image, error, loading }),
  //   options: ({ imageid }) => ({ variables: { id: imageid } }),
  // }),
  withImageQuery(),

  // withVisibleModalListWordsQuery(),
  // withMutVisibleModalListWords(),

  withMutImageLocalField('selectedWord'),
)(WordLabel);


