import React, { Component } from 'react';
import { compose, graphql } from "react-apollo";

// import { saveUserVotedImagewords, loadUserVotedImagewords } from '../util/LocalStorageUtil';
import { withWordQuery, withMetadataQuery } from '../graphql/WithQuery';
import { MUT_VOTE_WORD, } from '../graphql/GQLMutation';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';
import { setLocalStorageVotedWord, getLocalStorageVotedWord } from '../util/LocalStore';

import { Button } from 'antd';
import 'antd/dist/antd.css';

class VoteWords extends Component {
  constructor(props) {
    super(props);
    this.state = { voted: false };
  }

  componentDidMount() {
    const { id, metadata } = this.props;
    // console.log('VoteWords componentDidMount: ', id, metadata);
    if (!id || !metadata) return;
    const voted = getLocalStorageVotedWord(id, metadata);
    // console.log('VoteWords componentDidMount: ', voted);
    this.setState({ voted });
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    const { loginedUser, voteWord, id, metadata } = this.props;

    this.setState({ voted: !this.state.voted }, async () => {
      await voteWord({
        variables: {
          id,
          userToken: loginedUser ? loginedUser.token : null,
          vote: this.state.voted,
        }
      });
      setLocalStorageVotedWord(id, this.state.voted, metadata);
    });

  }

  render() {
    const { word } = this.props;
    // console.log('VoteWords: ',word);
    if (!word) return null;

    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <Button htmlType="submit" size="small" icon={this.state.voted ? "like" : "like-o"}>
            {`${word.vote}`}
          </Button>
        </form>
      </div>
    );
  }
}

// export default VoteWords;
export default compose(
  // withApollo,
  withWordQuery(),
  withMetadataQuery(),
  withLocalLoginedUserQuery(),
  //TODO:这里自动更新了vote（word及image的vote都自动更新）
  //那么 是从哪里进行了自动更新？
  graphql(MUT_VOTE_WORD, {
    name: `voteWord`,
    // options: (props) => ({
    //   update: (proxy, { data: { voteWord } }) => {
    //   },
    // }),
  }),
)(VoteWords);

