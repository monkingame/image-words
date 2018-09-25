import React, { Component } from 'react';
import { Table, Switch, Input, Col, Row, Modal, Button } from 'antd';
import 'antd/dist/antd.css';
import { compose, graphql, } from "react-apollo";
import gql from "graphql-tag";

import './Admin.css';
import { PAGE_SIZE } from './AdminConst';
import { isoDate2LocaleString } from '../util/CommonUtil';
import ManUser from './ManUser';

const Search = Input.Search;

// 管理所有用户 注意这个是复数
class ManUsers extends Component {

  // @2018-06-30 11:46:59
  constructor(props) {
    super(props);
    this.state = {
      // 单个用户管理
      visibleModalUser: false,
      userid: null,
    };
  }

  // @2018-06-30 11:47:58
  onSearchUserID = (userid) => {
    if (!userid) return;
    // console.log('onSearchUserID userid: ', userid);
    this.setState({ userid });
    this.setState({ visibleModalUser: true, });
  }

  handleCancelUser = () => {
    this.setState({ visibleModalUser: false, });
  }

  renderPagination = () => {
    const { usersCount, fetchMore, operToken, } = this.props;

    return {
      total: usersCount,
      pageSize: PAGE_SIZE,
      onChange: (page, size) => {
        // if (adminid) {
        // getUserList(adminid, (page - 1) * PAGE_SIZE, PAGE_SIZE);
        if (!operToken) return null;

        fetchMore({
          variables: {
            offset: (page - 1) * PAGE_SIZE,
          },
          updateQuery: (prev, { fetchMoreResult }) => {
            if (!fetchMoreResult) return prev;
            const more = fetchMoreResult.moreUsers;
            if (!more || more.length <= 0) {
              return prev;
            }
            return Object.assign({}, prev, {
              moreUsers: [...more]
            });
          },
        });
        // }
      }
    };
  }

  render() {
    const { usersCount, moreUsers, operToken } = this.props;
    if (!usersCount || usersCount <= 0 ||
      !moreUsers || moreUsers.length <= 0 ||
      !operToken) return null;
    // console.log('ManUsers moreUsers: ', moreUsers);

    return (
      <div>
        <div>
          <label>用户信息管理(总数：{usersCount})</label>
        </div>

        <div>
          <Row>
            <Col span={6} offset={2}>搜索用户</Col>
            <Col span={10}>
              <Search
                placeholder="输入用户ID"
                onSearch={value => this.onSearchUserID(value)}
                enterButton
              />
            </Col>
          </Row>

        </div>

        <div>
          <Table
            columns={this.genColumns()}
            dataSource={moreUsers.map(
              (user) => ({
                ...user,
                key: user.id,
                createdAt: isoDate2LocaleString(user.createdAt),
              })
            )}
            pagination={this.renderPagination()}
          />
        </div>

        <div>
          <Modal
            title="单个用户信息"
            visible={this.state.visibleModalUser}
            width='80%'
            onCancel={this.handleCancelUser}
            footer={[
              <Button key="back" onClick={this.handleCancelUser}>{"关闭"}</Button>,
            ]}
          >
            <ManUser
              operToken={this.props.operToken}
              userid={this.state.userid}
              adminid={this.props.adminid} />
          </Modal>
        </div>
      </div>
    );
  }

  genColumns = () => [
    {
      title: 'ID',
      dataIndex: 'id',
    }, {
      title: '用户名',
      dataIndex: 'username',
    }, {
      title: '管理员',
      dataIndex: 'admin',
      render: (text, record, index) => {
        const { adminid } = this.props;
        //不允许处理自己的权限，防止操作过程发生不可预知问题
        if (adminid === record.id) return (<div>自己</div>);

        return (
          <span>
            <Switch checked={record.admin}
              onChange={async (checked) => {
                const { promoteAdmin, operToken } = this.props;
                // const promte = 
                await promoteAdmin({
                  variables: {
                    operToken,
                    id: record.id,
                    admin: checked,
                  }
                });
                // console.log('promoteAdmin: ', promte);
              }}
            />
          </span>
        )
      },
    }, {
      title: '删除',
      dataIndex: 'deleted',
      render: (text, record, index) => {
        const { adminid } = this.props;
        //不允许处理自己的权限，防止操作过程发生不可预知问题
        if (adminid === record.id) return (<div>自己</div>);

        return (
          <span>
            <Switch checked={record.deleted}
              onChange={async (checked) => {
                const { delUser, operToken } = this.props;
                await delUser({
                  variables: {
                    operToken,
                    id: record.id,
                    deleted: checked,
                  }
                });
              }}
            />
          </span>
        )
      },
    }, {
      title: '注册时间',
      dataIndex: 'createdAt',
    },
  ];

}


export default compose(
  // withApollo,
  // withLocalLoginedUserQuery(),

  graphql(gql`
    query UsersCount($operToken: String!) {
      usersCount(operToken: $operToken)
    }`, {
      name: `usersCount`,
      props: ({ usersCount: { usersCount, error, loading } }) => ({ usersCount, error, loading }),
      options: ({ operToken }) => ({ variables: { operToken } }),
    }),

  graphql(gql`
    query MoreUsers($operToken: String!, $offset: Int!, $limit: Int!) {
      moreUsers(operToken: $operToken, offset: $offset, limit: $limit) @connection(key: "moreUsers") {
        id
        username
        admin
        createdAt
        updatedAt
        deleted
      }
    }`, {
      name: `moreUsers`,
      props: ({ moreUsers: { moreUsers, error, loading, fetchMore } }) =>
        ({ moreUsers, error, loading, fetchMore }),
      options: ({ operToken }) => ({ variables: { operToken, offset: 0, limit: PAGE_SIZE } }),
    }),

  graphql(gql`
    mutation PromoteAdmin($operToken: String!, $id: ID!, $admin: Boolean!) {
      promoteAdmin(operToken: $operToken, id: $id, admin: $admin) {
        id
        username
        admin
        createdAt
      }
    }`, {
      name: `promoteAdmin`,
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

)(ManUsers);

