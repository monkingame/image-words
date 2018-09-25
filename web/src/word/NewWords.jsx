import React, { Component } from 'react';
// import { connect } from 'react-redux';
// import { newWords } from './actions';
// import { getLoginUserID } from '../login/Util';
import { graphql, compose, } from "react-apollo";

import { Button, Row, Col, Form, Input, message } from 'antd';
import 'antd/dist/antd.css';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';
import { MUT_ADD_WORD } from '../graphql/GQLMutation';
// import { QUERY_WORDS_BY_IMAGEID } from '../graphql/GQLQuery';
import { QUERY_MORE_WORDS_BY_IMAGEID } from '../graphql/GQLQuery';
import { WORDS_MAX_LENGTH, } from '../util/GlobalConst';
// import { DISABLE_INPUT_INTERVAL } from '../util/GlobalConst';
import withTimeoutCounter from '../hoc/HOCTimeoutCounter';
import { withMutImageLocalField } from '../graphql/WithMutation';


const FormItem = Form.Item;


class NewWords extends Component {
  constructor(props) {
    super(props);
    this.state = {
      content: '',
    };
  }

  handleSubmit = async (e) => {
    e.preventDefault();
    if (!this.state.content) {
      message.error("请输入说说");
      return;
    }

    const { loginedUser, addWord, imageid, updateImageLocalSelectedWord, } = this.props;
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
    //TODO:去掉此timerout 改成正常的
    startCounter();
  }

  handleTextChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }


  render() {
    const { loginedUser, } = this.props;
    if (!loginedUser) return null;
    const { counterStr, ticking, } = this.props.timeoutCounter;
    // console.log('NewWords ticking: ', ticking);

    return (
      <div>
        <Row>
          <Form onSubmit={this.handleSubmit}>
            <Col span={16}>
              <FormItem>
                <Input name="content" type="text"
                  maxLength={WORDS_MAX_LENGTH.toString()}
                  value={this.state.content} onChange={this.handleTextChange}
                  // disabled={this.state.counter > 0}
                  // placeholder={(this.state.counter > 0) ? `请等待${this.state.counter}后继续说说` : `配句说说(不能超过${WORDS_MAX_LENGTH}字符)`} 
                  disabled={ticking}
                  // placeholder={ticking ? `请等待${counter}后继续说说` : `配句说说(不能超过${WORDS_MAX_LENGTH}字符)`}
                  placeholder={`不能多于${WORDS_MAX_LENGTH}字${counterStr}`}
                />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem>
                <Button htmlType="submit" disabled={ticking}>
                  {/* {`说说${counterStr}`} */}
                  {`说说`}
                </Button>
              </FormItem>
            </Col>
          </Form>
        </Row>
      </div>
    );
  }
}


export default compose(
  withLocalLoginedUserQuery(),
  graphql(MUT_ADD_WORD, {
    name: `addWord`,
    options: (props) => ({
      update: (proxy, { data: { addWord } }) => {
        if (!addWord) return;

        const { imageid } = props;
        // console.log('NewWords update :', imageid, addWord);
        // const data = proxy.readQuery({ query: QUERY_WORDS_BY_IMAGEID, variables: { imageid } });
        // console.log('NewWords update :', imageid, data);
        const data = proxy.readQuery({ query: QUERY_MORE_WORDS_BY_IMAGEID, variables: { imageid } });
        // console.log('NewWords update :', imageid, data);
        data.moreWordsByImageId.unshift(addWord);
        // proxy.writeQuery({ query: QUERY_WORDS_BY_IMAGEID, data, variables: { imageid } });
        proxy.writeQuery({ query: QUERY_MORE_WORDS_BY_IMAGEID, data, variables: { imageid } });
      },
    }),
  }),

  withMutImageLocalField('selectedWord'),

)(withTimeoutCounter(NewWords));

