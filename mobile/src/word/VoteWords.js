import React, { Component } from 'react';
// import { connect } from 'react-redux';
import { View, } from 'react-native';
import { compose, graphql } from "react-apollo";

// import { getWordsVote } from './Util';
// import { voteWords } from './actions';

import { withWordQuery, withMetadataQuery } from '../graphql/WithQuery';
import { MUT_VOTE_WORD, } from '../graphql/GQLMutation';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';
// import { setLocalStorageVotedWord, getLocalStorageVotedWord } from '../util/LocalStore';
import { setLocalStorageVotedWord, getLocalStorageVotedWord } from './Util';
import { ButtonCommon, } from '../components/button';
import { BUTTON_TYPE_VOTE, } from '../components/button';

class VoteWords extends Component {
  constructor(props) {
    super(props);
    this.state = { voted: false };
  }

  async componentDidMount() {
    const { id, metadata } = this.props;
    // console.log('VoteWords componentDidMount: ', id, metadata);
    if (!id || !metadata) return;
    const voted = await getLocalStorageVotedWord(id, metadata);
    // console.log('VoteWords componentDidMount: ', voted);
    this.setState({ voted });
  }

  handleSubmit = async () => {
    const { loginedUser, voteWord, id, metadata } = this.props;
    this.setState({ voted: !this.state.voted }, async () => {
      await voteWord({
        variables: {
          id,
          userToken: loginedUser ? loginedUser.token : null,
          vote: this.state.voted,
        }
      });
      // console.log('VoteWords handleSubmit: ', id, this.state.voted);
      await setLocalStorageVotedWord(id, this.state.voted, metadata);
    });
  }

  render() {
    const { word } = this.props;
    // console.log('VoteWords: ',word);
    if (!word) return null;
    // console.log('VoteWords voted: ', this.state.voted);

    return (
      <View style={{ flexDirection: 'row' }}>
        <ButtonCommon
          type={BUTTON_TYPE_VOTE}
          onPress={this.handleSubmit}
          status={this.state.voted}
          text={word.vote}
        />

      </View>
    );
  }
}

// const mapStateToProps = (state, ownProps) => {
//   return {
//     vote: getWordsVote(state, ownProps._id),
//     userid: getLoginUserID(state)
//   };
// }

// const mapDispatchToProps = (dispatch) => {
//   return {
//     voteWords: (_id, voted, userid, imageid) => {
//       dispatch(voteWords(_id, voted, userid, imageid));
//     }
//   }
// }

// const VoteWordsContainer = connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(VoteWords)

// export default VoteWordsContainer;
export default compose(
  withWordQuery(),
  withMetadataQuery(),
  withLocalLoginedUserQuery(),
  graphql(MUT_VOTE_WORD, {
    name: `voteWord`,
  }),
)(VoteWords);

