import React, { Component } from 'react';
import { graphql, compose, } from "react-apollo";
import { QUERY_IMAGE } from '../graphql/GQLQuery';
// import { withMutImageSelectedWord } from '../graphql/WithMutation';
import { withMutImageLocalField } from '../graphql/WithMutation';
// import { QUEREY_BLOCK, } from '../graphql/GQLQuery';
// import { withLocalLoginedUserQuery, } from '../graphql/WithQuery';
// import { withMutSwitchBlock } from '../graphql/WithMutation';

class WordsLabel extends Component {

  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     block: false,
  //   };
  // }

  onClickLabel = async () => {
    // const { imageid, content, client, image, updateImageSelectedWord } = this.props;
    const { imageid, content, image, updateImageLocalSelectedWord } = this.props;
    //这里主要是判断是否存在query cache，否则readQuery可能出错
    if (!image) return;
    // image.selectedWord = content;
    //TODO:此处将被替换为新的resolver
    // client.writeQuery({
    //   query,
    //   variables: { id: imageid },
    //   data: { image: { ...image, selectedWord: content } }
    // });
    await updateImageLocalSelectedWord({
      variables: {
        id: imageid,
        selectedWord: content,
      }
    });
  }

  // fetchBlock = async () => {
  //   const { client, id, loginedUser } = this.props;
  //   if (!client || !id) return;
  //   if (loginedUser) {
  //     const { data } = await client.query({
  //       query: QUEREY_BLOCK,
  //       variables: {
  //         userToken: loginedUser.token,
  //         banid: id,
  //       },
  //     });
  //     const { block } = data;
  //     this.setState({ block });
  //   } else {
  //     this.setState({ block: false });
  //   }
  // }

  // async componentDidMount() {
  //   // const { id, loginedUser } = this.props;
  //   // console.log('WordsLabel componentDidMount : ', loginedUser);
  //   this.fetchBlock();
  // }

  // // 感觉页面加载速度变慢了 难道是await原因？
  // async componentWillReceiveProps(nextProps) {
  //   const { client, id } = this.props;
  //   const { loginedUser } = nextProps;
  //   // if (loginedUser) {
  //   // console.log('WordsLabel componentWillReceiveProps : ', loginedUser);
  //   // }
  //   if (!loginedUser || !client || !id) {
  //     this.setState({ block: false });
  //     // console.log('WordsLabel componentWillReceiveProps : ', block);
  //     return;
  //   };
  //   const { data } = await client.query({
  //     query: QUEREY_BLOCK,
  //     variables: {
  //       userToken: loginedUser.token,
  //       banid: id,
  //     },
  //   });
  //   const { block } = data;
  //   // console.log('WordsLabel componentWillReceiveProps : ', block);
  //   this.setState({ block });
  // }


  render() {
    // const { imageid, id, content, image } = this.props;
    // if (!imageid || !id || !content|| !image) return null;
    // const { block } = this.props;
    // console.log('WordsLabel block : ', block);

    const { content } = this.props;
    if (!content) return null;

    return (
      <div onClick={this.onClickLabel}
      //  className="words-label"
      >
        <label>{content}</label>
      </div>
    );
  }
}

// export default WordsLabel;

export default compose(
  // withApollo,
  // withLocalLoginedUserQuery(),

  graphql(QUERY_IMAGE, {
    name: `image`,
    props: ({ image: { image, error, loading } }) => ({ image, error, loading }),
    options: ({ imageid }) => ({ variables: { id: imageid } }),
  }),

  // withMutImageSelectedWord(),
  withMutImageLocalField('selectedWord'),

  // graphql(QUEREY_BLOCK, {
  //   name: `block`,
  //   props: ({ block: { block, } }) => ({ block, }),
  //   options: ({ loginedUser, id }) => ({ variables: { userToken: loginedUser ? loginedUser.token : null, banid: id } }),
  // }),

)(WordsLabel);

