import React, { Component } from 'react';
import { Switch, Col, Row, } from 'antd';
import 'antd/dist/antd.css';
import { compose, graphql, } from "react-apollo";
import gql from "graphql-tag";

import './Admin.css';
import { isoDate2LocaleString } from '../util/CommonUtil';
import { UserType, } from './AdminFragment';

// 管理单个用户 注意这个是单数
// @2018-06-29 11:26:30
class ManUser extends Component {

  render() {
    const { operToken, user } = this.props;
    if (!operToken || !user) return null;
    // console.log('ManUser user: ', user);
    // const { adminid, } = this.props;

    return (
      <div>
        <div>
          <label>图片上传者的信息</label>
          <hr />

          <Row>
            <Col span={12}>ID</Col>
            <Col span={12}>{user.id}</Col>
          </Row>

          <Row>
            <Col span={12}>用户名</Col>
            <Col span={12}>{user.username}</Col>
          </Row>

          <Row>
            <Col span={12}>电话</Col>
            <Col span={12}>{user.phone}</Col>
          </Row>

          {/* <Row>
            <Col span={12}>管理员</Col>
            <Col span={12}>{user.admin}</Col>
          </Row> */}

          <Row>
            <Col span={12}>是否删除</Col>
            <Col span={12}>

              {
                (this.props.adminid === user.id) ?
                  (<div>自己</div>) :
                  <Switch checked={user.deleted}
                    onChange={async (checked) => {
                      const { delUser, operToken } = this.props;
                      await delUser({
                        variables: {
                          operToken,
                          id: user.id,
                          deleted: checked,
                        }
                      });
                    }}
                  />
              }

            </Col>
          </Row>

          <Row>
            <Col span={12}>注册时间</Col>
            <Col span={12}>{isoDate2LocaleString(user.createdAt)}</Col>
          </Row>

        </div>
      </div>
    );
  }

}


export default compose(
  // withApollo,
  // withLocalLoginedUserQuery(),

  graphql(gql`
    query User($id: ID!, $operToken: String!) {
      user(id: $id, operToken: $operToken) {
        ...UserTypeDetails
      }
    }
    ${UserType.fragments.details}`, {
      name: `user`,
      props: ({ user: { user, error, loading, } }) =>
        ({ user, error, loading, }),
      options: ({ operToken, userid }) => ({ variables: { id: userid, operToken, } }),
    }),

  graphql(gql`
    mutation DelUser($operToken: String!, $id: ID!, $deleted: Boolean!) {
          delUser(operToken: $operToken, id: $id, deleted: $deleted) {
          id
        username
        deleted
      }
    }`, {
      name: `delUser`,
    }),

)(ManUser);

