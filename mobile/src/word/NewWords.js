import React, { Component } from 'react';
// import { connect } from 'react-redux';
import { Text, View, FlatList, Button, Alert, StyleSheet, TextInput } from 'react-native';
import { graphql, compose, } from "react-apollo";

// import { WORDS_MAX_LENGTH, DISABLE_INPUT_INTERVAL } from './ConstFile';
// import { postNewWords } from './actions';
// import { getLoginUserID } from '../login/LoginUtil';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';
import { MUT_ADD_WORD } from '../graphql/GQLMutation';
import { QUERY_MORE_WORDS_BY_IMAGEID } from '../graphql/GQLQuery';
import { WORDS_MAX_LENGTH, } from '../util/GlobalConst';
import withTimeoutCounter from '../hoc/HOCTimeoutCounter';
import { ButtonCommon } from '../components/button';
import { BUTTON_TYPE_ADD } from '../components/button';
import { withMutImageLocalField } from '../graphql/WithMutation';


class NewWords extends Component {
  constructor(props) {
    super(props);
    this.timer = null;
    this.state = {
      content: '',
    };
  }


  // //TODO:注意，如果组件销毁时（如关闭或切换页面）禁止倒计时还未完成，可能导致出现问题。应该用mounted标志判断
  // componentWillUnmount() {
  //   clearInterval(this.timer);
  // }


  handleSubmit = async () => {
    if (!this.state.content) {
      Alert.alert("请输入说说");
      return;
    }

    const { loginedUser, addWord, imageid, updateImageLocalSelectedWord } = this.props;
    if (!loginedUser) return null;
    const { startCounter, waitInfinite } = this.props.timeoutCounter;

    waitInfinite();
    const result = await addWord({
      variables: {
        userToken: loginedUser.token,
        imageid,
        content: this.state.content.trim(),
      }
    });

    if (result) {
      const added = result.data.addWord;
      // console.log('NewWords handleSubmit addWord: ', added);

      if (added) {
        // console.log('NewWord added: ', added);
        await updateImageLocalSelectedWord({
          variables: {
            id: imageid,
            selectedWord: added.content,
          }
        });
      }
    }

    this.setState({ content: '' });
    startCounter();
  }

  // handleTextChange = (e) => {
  //   const { name, value } = e.target;
  //   this.setState({ [name]: value });
  // }


  render() {

    const { loginedUser, } = this.props;
    if (!loginedUser) return null;
    const { counterStr, ticking, } = this.props.timeoutCounter;

    return (
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <TextInput
            maxLength={WORDS_MAX_LENGTH}
            value={this.state.content}
            onChangeText={(content) => this.setState({ content })}
            editable={!ticking}
            placeholder={ticking ? `请等待${counterStr}后继续说说` : `新说说(最多${WORDS_MAX_LENGTH}字符)`}
            autoCapitalize='none'
            style={styles.input}
            underlineColorAndroid='rgba(0,0,0,0)'
          />
        </View>

        <View style={styles.buttonContainer}>
          <ButtonCommon type={BUTTON_TYPE_ADD}
            onPress={this.handleSubmit}
            disabled={ticking}
            text={`说说`} />
        </View>

      </View>
    );
  }
}


export default compose(
  withLocalLoginedUserQuery(),

  graphql(MUT_ADD_WORD, {
    name: `addWord`,
    options: (props) => ({
      update: (proxy, { data: { addWord } }) => {
        // console.log('NewWords addWord update: ', addWord);
        if (!addWord) return;

        const { imageid } = props;
        const data = proxy.readQuery({ query: QUERY_MORE_WORDS_BY_IMAGEID, variables: { imageid } });
        data.moreWordsByImageId.unshift(addWord);
        proxy.writeQuery({ query: QUERY_MORE_WORDS_BY_IMAGEID, data, variables: { imageid } });
      },
    }),
  }),

  withMutImageLocalField('selectedWord'),

)(withTimeoutCounter(NewWords));



const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
    flexDirection: 'row',
  },
  inputContainer: {
    flex: 3,
    // borderWidth: 3,
    // borderColor: 'blue',
  },
  input: {
    // borderBottomColor: '#adadad',
    // borderBottomWidth: 0,
    // marginVertical: 10,
    borderWidth: 0,
    // borderWidth: 3,
    // borderColor: 'blue',
  },
  buttonContainer: {
    flex: 1,
  },
});

