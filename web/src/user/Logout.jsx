import React, { Component } from 'react';
import { compose, withApollo } from 'react-apollo';
import { Form, Button, Row, Col } from 'antd';
import 'antd/dist/antd.css';

import './User.css';
import { withMutLocalLoginedUser, } from '../graphql/WithMutation';
import { withMetadataQuery } from '../graphql/WithQuery';
import { setLocalStorageLoginedUser } from '../util/LocalStore';

const FormItem = Form.Item;

class Logout extends Component {
  handleSubmit = async (e) => {
    e.preventDefault();

    const { metadata, updateLoginedUser } = this.props;

    // const { updateLoginedUser } = this.props;
    await updateLoginedUser({
      variables: {
        loginedUser: null,
      }
    });

    //存储到本地
    setLocalStorageLoginedUser(null, metadata);
  }

  render() {
    // const { loading, error, metadata, } = this.props;

    return (
      <div>
        <Row >
          <Col span={4} offset={10}>
            <Form onSubmit={this.handleSubmit} className="login-form login">
              <FormItem>
                <Button icon="logout" type="danger" htmlType="submit" className="login-form-button">
                  {"注销"}
                </Button>
              </FormItem>
            </Form>
          </Col>
        </Row>

      </div>
    );
  }
}


export default compose(
  withApollo,
  // graphql(QUERY_METADATA, {
  //   name: `metadata`,
  //   props: ({ metadata: { metadata } }) => ({ metadata }),
  //   options: () => ({ variables: VARIABLES_CLIENT_IDENTIFY }),
  // }),
  withMetadataQuery(),
  // graphql(MUT_LOCAL_LOGINED_USER, {
  //   name: `updateLoginedUser`,
  // }),
  withMutLocalLoginedUser(),
)(Logout);

