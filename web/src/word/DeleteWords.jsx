import React, { Component } from 'react';
import { Button, Modal, Icon } from 'antd';
import 'antd/dist/antd.css';
import { compose, graphql } from "react-apollo";

import './Vote.css';

// import { QUERY_WORDS_BY_IMAGEID } from '../graphql/GQLQuery';
import { QUERY_MORE_WORDS_BY_IMAGEID } from '../graphql/GQLQuery';
import { withWordQuery, } from '../graphql/WithQuery';
import { MUT_DEL_WORD, } from '../graphql/GQLMutation';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';

class DeleteWords extends Component {
  state = { visible: false };

  handleOk = async () => {
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


  render() {
    const { loginedUser, word } = this.props;
    // console.log('DeleteWords word: ', word);
    if (!loginedUser || !word) return null;
    // const { author } = word;
    // if (!author) return null;
    if (loginedUser.id !== word.authorid) return null;

    return (
      <div className="delete-words-container">
        <Button htmlType="submit" size="small" type="danger" icon="delete" onClick={() => this.setState({ visible: true, })} />

        <Modal
          title="确认删除吗？"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={() => this.setState({ visible: false })}
        >
          <p><Icon type="exclamation-circle" style={{ fontSize: 36 }} />{"删除不可回复"}</p>
        </Modal>
      </div >
    );
  }
}


export default compose(
  // withApollo,
  withWordQuery(),
  withLocalLoginedUserQuery(),
  graphql(MUT_DEL_WORD, {
    name: `delWord`,
    options: (props) => ({
      //TODO:update如何获取组件的props？比如有些variables需要props
      //NOTE:https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-config-options
      update: (proxy, { data: { delWord } }) => {
        const { imageid } = props;
        // const data = proxy.readQuery({ query: QUERY_WORDS_BY_IMAGEID, variables: { imageid } });
        // // console.log('MUT_DEL_WORD data: ', data);
        // const index = data.wordsByImageId.findIndex((ele) => (ele.id === delWord.id));
        // data.wordsByImageId.splice(index, 1);
        // proxy.writeQuery({ query: QUERY_WORDS_BY_IMAGEID, data, variables: { imageid } });
        const data = proxy.readQuery({ query: QUERY_MORE_WORDS_BY_IMAGEID, variables: { imageid } });
        const index = data.moreWordsByImageId.findIndex((ele) => (ele.id === delWord.id));
        data.moreWordsByImageId.splice(index, 1);
        proxy.writeQuery({ query: QUERY_MORE_WORDS_BY_IMAGEID, data, variables: { imageid } });
      },
    }),
  }),
)(DeleteWords);

