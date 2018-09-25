import React, { Component } from 'react';
import md5 from 'md5';
import 'antd/dist/antd.css';
import { Form, Icon, Input, Button, Row, Col, Tooltip, message } from 'antd';
import { graphql, compose, withApollo } from "react-apollo";

import './User.css';

import { QUERY_USER_EXIST, QUERY_LOGIN, } from '../graphql/GQLQuery';
import { withMetadataQuery } from '../graphql/WithQuery';
import { MUT_ADD_USER, } from '../graphql/GQLMutation';
import { withMutLocalLoginedUser, } from '../graphql/WithMutation';
import { setLocalStorageLoginedUser } from '../util/LocalStore';
import { VARIABLES_CLIENT_IDENTIFY } from '../util/GlobalConst';

const FormItem = Form.Item;


class Register extends Component {
  constructor(props) {
    super(props);
    this.state = { confirmDirty: false };
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        const { username, password } = values;

        // console.log('Register : ', username, password);
        const { client, addUser, metadata, updateLoginedUser } = this.props;
        const { data } = await client.query({
          query: QUERY_USER_EXIST,
          variables: { username },
          fetchPolicy: 'network-only'
        });
        const { userExist } = data;

        if (userExist) {
          message.error(`用户${username}已经存在`);
        } else {
          const result = await addUser({
            variables: {
              username,
              password: md5(password),
              ...VARIABLES_CLIENT_IDENTIFY,
            }
          });
          // const user = result.data.addUser;
          // console.log(user);
          const user = result.data.addUser;

          // UpdateLocalLoginedUser({ client, login: user });
          await updateLoginedUser({
            variables: {
              loginedUser: user,
            }
          });
          // console.log('Register handleSubmit: ', user);

          setLocalStorageLoginedUser(user, metadata);

          // UpdateRegisterUserAutoLogin({ client, login: user, variables: { username, password } });
          //注册成功后，将注册用户加入到登录缓存列表中。
          // 否则 如果在注册前尝试登录不存在的用户假设为xxx，那么缓存会记住此用户xxx不存在，
          // 而用户注册成功xxx并准备登录，因为刚才缓存原因，不允许xxx登录
          client.writeQuery({
            query: QUERY_LOGIN,
            data: { login: user },
            variables: { username, password: md5(password) }
          });
        }
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
      <div>
        <Row>
          <Col span={12} offset={6}>
            <Form onSubmit={this.handleSubmit}>

              <FormItem
                {...formItemLayout}
                label={(
                  <span>
                    {"用户名"}
                    <Tooltip title="只能输入字母，不区分大小写">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                )}
                hasFeedback
              >
                {getFieldDecorator('username', {
                  rules: [{ required: true, message: '请输入想使用的用户名', whitespace: true },
                  { min: 5, message: '用户名不能少于5字符' },
                  { max: 32, message: '用户名不能多于32字符' },
                  { pattern: /^[a-zA-Z]+$/, message: '用户名只能为字母（不区分大小写）' },
                  ],
                })(
                  <Input />
                )}
              </FormItem>

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

              <FormItem
                {...formItemLayout}
                label="EMail"
                hasFeedback
              >
                {getFieldDecorator('email', {
                  rules: [{
                    type: 'email', message: '电子邮件格式无效',
                  }, {
                    required: false, message: '请输入电子邮件',
                  }],
                })(
                  <Input disabled />
                )}
              </FormItem>

              <FormItem
                {...formItemLayout}
                label="电话号码"
              >
                {getFieldDecorator('phone', {
                  rules: [{ required: false, message: '请输入电话号码' }],
                })(
                  // <Input addonBefore={prefixSelector} style={{ width: '100%' }} />
                  <Input disabled />
                )}
              </FormItem>

              <FormItem
                {...formItemLayout}
                label="验证码"
              // extra="证明你是真正的人类，而不是自动化程序"
              >
                <Row gutter={8}>
                  <Col span={12}>
                    {getFieldDecorator('captcha', {
                      rules: [{ required: false, message: '输入验证码' }],
                    })(
                      <Input size="large" disabled />
                    )}
                  </Col>
                  <Col span={12}>
                    <Button size="large" disabled>获取验证码</Button>
                  </Col>
                </Row>
              </FormItem>
              {/* <FormItem {...tailFormItemLayout} style={{ marginBottom: 8 }}>
                {getFieldDecorator('agreement', {
                  valuePropName: 'checked',
                })(
                  <Checkbox>我已经阅读过<a href="">协议</a></Checkbox>
                  )}
              </FormItem> */}
              <FormItem {...tailFormItemLayout}>
                <Button type="primary" htmlType="submit" style={{ width: "100%" }}>注册</Button>
              </FormItem>
            </Form>

          </Col>
        </Row>
      </div>
    );

  }
}


const WrappedRegistrationForm = Form.create()(Register);

export default compose(
  withApollo,
  graphql(MUT_ADD_USER, {
    name: `addUser`,
  }),
  // graphql(QUERY_METADATA, {
  //   name: `metadata`,
  //   props: ({ metadata: { metadata } }) => ({ metadata }),
  //   options: () => ({ variables: VARIABLES_CLIENT_IDENTIFY }),
  // }),
  withMetadataQuery(),
  withMutLocalLoginedUser(),
)(WrappedRegistrationForm);

