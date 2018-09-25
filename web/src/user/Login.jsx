import React, { Component } from 'react';
import { Form, Icon, Input, Button, Row, Col, message } from 'antd';
import 'antd/dist/antd.css';
import { compose, withApollo } from 'react-apollo';
import md5 from 'md5';

import './User.css';

import { QUERY_LOGIN, } from '../graphql/GQLQuery';
import { withMetadataQuery } from '../graphql/WithQuery';
import { withMutLocalLoginedUser, } from '../graphql/WithMutation';
import { setLocalStorageLoginedUser } from '../util/LocalStore';

const FormItem = Form.Item;


class Login extends Component {
  constructor(props) {
    super(props);
    this.state = { username: '', password: '' };
  }

  //TODO:似乎这个函数没用了？
  handleChange = (e) => {
    const target = e.target;
    const name = target.name;
    const value = target.value;
    this.setState({ [name]: value });
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        const { username, password } = values;

        const { client, metadata, updateLoginedUser } = this.props;
        const { data } = await client.query({
          query: QUERY_LOGIN,
          variables: {
            username,
            password: md5(password),
          },
          // @2018-06-28 11:01:52 
          // fetchPolicy 改为 no-cache。那么Register和ChangePassword的writeQuery(QUERY_LOGIN)应该就没用了吧？
          fetchPolicy: 'no-cache',
        });
        const { login } = data;
        // console.log(`Login handleSubmit: `, login);

        await updateLoginedUser({
          variables: {
            loginedUser: login,
          }
        });

        setLocalStorageLoginedUser(login, metadata);
        if (!login) {
          message.error(`用户名或密码输入错误`);
        }
      }
    });
  }

  render() {
    // const { metadata } = this.props;
    // console.log('Login metadata: ', metadata);

    const { getFieldDecorator } = this.props.form;

    return (
      <div className="login">

        <Row >
          <Col span={8} offset={8}>
            <Form onSubmit={this.handleSubmit} className="login-form login">
              <FormItem>
                {getFieldDecorator('username', {
                  rules: [
                    { required: true, message: '请输入用户名' },
                  ],
                })(
                  <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="用户名" />
                )}
              </FormItem>

              <FormItem>
                {getFieldDecorator('password', {
                  rules: [{ required: true, message: '请输入密码' }],
                })(
                  <Input prefix={<Icon type="lock" style={{ fontSize: 13 }} />} type="password" placeholder="密码" />
                )}
              </FormItem>

              <FormItem>
                <Button type="primary" htmlType="submit" className="login-form-button">
                  {"登录"}
                </Button>

              </FormItem>
            </Form>
          </Col>
        </Row>

      </div>
    );

  }
}


const WrappedNormalLoginForm = Form.create()(Login);


// export default () => (
//   <ApolloConsumer>
//     {client => <WrappedNormalLoginForm client={client} />}
//   </ApolloConsumer>
// );

export default compose(
  withApollo,
  // graphql(QUERY_METADATA, {
  //   name: `metadata`,
  //   props: ({ metadata: { metadata } }) => ({ metadata }),
  //   options: () => ({ variables: VARIABLES_CLIENT_IDENTIFY }),
  // }),
  withMetadataQuery(),
  withMutLocalLoginedUser(),
)(WrappedNormalLoginForm);

