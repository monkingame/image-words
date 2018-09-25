import React, { Component } from 'react';
// import { connect } from 'react-redux';
import { Alert } from 'react-native';
import { compose, graphql } from "react-apollo";

// import ButtonDelete from '../components/button/ButtonDelete';
// import { deleteWords } from './actions';
import ButtonCommon from '../components/button/ButtonCommon';
import { BUTTON_TYPE_DELETE } from '../components/button/ButtonConst';
import { QUERY_MORE_WORDS_BY_IMAGEID } from '../graphql/GQLQuery';
import { withWordQuery, } from '../graphql/WithQuery';
import { MUT_DEL_WORD, } from '../graphql/GQLMutation';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';

class DeleteWords extends Component {

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  doDelete = () => {
    Alert.alert(
      '删除说说',
      '确认删除吗？不可恢复',
      [
        {
          text: '取消',
          // onPress: this.handleCancel,
          style: 'cancel'
        },
        {
          text: '删除',
          onPress: this.handleDelete
        },
      ],
      // { cancelable: false }
    )
  }


  handleDelete = async () => {
    // const { deleteId, _id } = this.props;
    // deleteId(_id);
    this.setState({ visible: false });
    const { loginedUser, word, delWord, id } = this.props;
    if (!loginedUser || !word) return;

    await delWord({
      variables: {
        id,
        userToken: loginedUser.token,
      }
    });
  }

  // handleCancel = () => {
  // }

  render() {
    // const { isMine } = this.props;
    // if (!isMine) return null;

    const { loginedUser, word } = this.props;
    // console.log('DeleteWords word: ', word);
    if (!loginedUser || !word) return null;
    // const { author } = word;
    // if (!author) return null;
    if (loginedUser.id !== word.authorid) return null;

    return (
      // <View style={{ flex: 1, }}>
      <ButtonCommon type={BUTTON_TYPE_DELETE} onPress={this.doDelete} />
      // </View>
    );
  }
}

// const mapStateToProps = (state, ownProps) => {
//   return {
//     isMine: isWordsOwnCurrentUser(state, ownProps._id)
//   };
// }

// const mapDispatchToProps = (dispatch) => {
//   return {
//     deleteId: (_id) => {
//       dispatch(deleteWords(_id));
//     }
//   }
// }

// const DeleteWordsContainer = connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(DeleteWords);

// export default DeleteWordsContainer;

export default compose(
  withWordQuery(),
  withLocalLoginedUserQuery(),
  graphql(MUT_DEL_WORD, {
    name: `delWord`,
    options: (props) => ({
      //TODO:update如何获取组件的props？比如有些variables需要props
      //NOTE:https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-config-options
      update: (proxy, { data: { delWord } }) => {
        const { imageid } = props;
        const data = proxy.readQuery({ query: QUERY_MORE_WORDS_BY_IMAGEID, variables: { imageid } });
        const index = data.moreWordsByImageId.findIndex((ele) => (ele.id === delWord.id));
        data.moreWordsByImageId.splice(index, 1);
        proxy.writeQuery({ query: QUERY_MORE_WORDS_BY_IMAGEID, data, variables: { imageid } });
      },
    }),
  }),
)(DeleteWords);


