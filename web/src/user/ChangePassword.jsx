import React, { Component } from 'react';
import md5 from 'md5';
import 'antd/dist/antd.css';
import { Form, Input, Button, Row, Col, message } from 'antd';
import { graphql, compose, withApollo } from "react-apollo";

import './User.css';

import { QUERY_LOGIN, } from '../graphql/GQLQuery';
// import { withMetadataQuery } from '../graphql/WithQuery';
import { MUT_CHANGE_PASSWORD, } from '../graphql/GQLMutation';
// import { withMutLocalLoginedUser, } from '../graphql/WithMutation';
// import { setLocalStorageLoginedUser } from '../util/LocalStore';
// import { VARIABLES_CLIENT_IDENTIFY } from '../util/GlobalConst';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';

const FormItem = Form.Item;


class ChangePassword extends Component {
  constructor(props) {
    super(props);
    this.state = { confirmDirty: false };
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    const { loginedUser } = this.props;
    if (!loginedUser) {
      message.error(`请先登录`);
      return;
    };

    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        const { password } = values;
        const { id, username, token, } = loginedUser;

        // console.log('Register : ', username, password);
        const { client, changePassword, } = this.props;

        const result = await changePassword({
          variables: {
            token,
            id,
            password: md5(password),
          }
        });
        const user = result.data.changePassword;
        // console.log('ChangePassword handleSubmit: ', user);

        // await updateLoginedUser({
        //   variables: {
        //     loginedUser: user,
        //   }
        // });
        // setLocalStorageLoginedUser(user, metadata);

        if (user) {
          this.props.form.resetFields();
          message.success('密码修改完成');
        }

        client.writeQuery({
          query: QUERY_LOGIN,
          data: { login: user },
          variables: { username, password: md5(password), }
        });
      }
    });

  }

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }

  checkPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('两次密码不符');
    } else {
      callback();
    }
  }

  checkConfirm = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  }


  render() {
    const { loginedUser } = this.props;
    if (!loginedUser) return null;

    const { getFieldDecorator } = this.props.form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 },
      },
    };
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0,
        },
        sm: {
          span: 14,
          offset: 6,
        },
      },
    };

    return (
      <div className="change-password">
        {"更改密码"}
        <Row>
          <Col span={12} offset={6}>
            <Form onSubmit={this.handleSubmit}>

              <FormItem
                {...formItemLayout}
                label="密码"
                hasFeedback
              >
                {getFieldDecorator('password', {
                  rules: [{ required: true, message: '请输入密码', },
                  { min: 5, message: '密码不能少于5字符' },
                  { max: 32, message: '密码不能多于32字符' },
                  { validator: this.checkConfirm, },
                  ],
                })(
                  <Input type="password" />
                )}
              </FormItem>

              <FormItem
                {...formItemLayout}
                label="密码确认"
                hasFeedback
              >
                {getFieldDecorator('confirm', {
                  rules: [{
                    required: true, message: '请再次输入密码',
                  }, {
                    validator: this.checkPassword,
                  }],
                })(
                  <Input type="password" onBlur={this.handleConfirmBlur} />
                )}
              </FormItem>

              <FormItem {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit" style={{ width: "100%" }}>修改密码</Button>
              </FormItem>
            </Form>

          </Col>
        </Row>
      </div>
    );

  }
}


const WrappedChangePasswordForm = Form.create()(ChangePassword);

export default compose(
  withApollo,

  graphql(MUT_CHANGE_PASSWORD, {
    name: `changePassword`,
  }),

  // withMetadataQuery(),
  withLocalLoginedUserQuery(),
  // withMutLocalLoginedUser(),
)(WrappedChangePasswordForm);

