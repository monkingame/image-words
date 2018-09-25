import React, { Component } from 'react';
// import { connect } from 'react-redux';
import { Tabs, } from 'antd';
import 'antd/dist/antd.css';
import { compose, withApollo, } from "react-apollo";
import gql from "graphql-tag";

import { withLocalLoginedUserQuery } from '../graphql/WithQuery';

import './Admin.css';

import RouteNotFound from '../components/NotFound';
import ManUsers from './ManUsers';
import ManReportImage from './ManReportImage';
import ManImage from './ManImage';

const TabPane = Tabs.TabPane;

const KEY_USER = 'user';
const KEY_SHUOSHUO = 'shuoshuo';
const KEY_REPORT = 'report';

//TODO:判断是否管理员，必须从服务器进行判断，而不能保存在本地storage
// 因为本地存储的数据 可能会被篡改 如果把admin标志保存在本地 万一被破解 整个系统就暴露了
class Admin extends Component {

  constructor(props) {
    super(props);
    this.state = {
      tab: KEY_USER,
      isAdmin: false,
    };
  }

  onChangeTab = (tab) => {
    // console.log(tab);
    this.setState({ tab });
  }

  // componentDidMount() {
  //   console.log('Admin componentDidMount: ', this.props);
  // }

  //TODO:async可以起作用吗？在componentWillReceiveProps中
  async componentWillReceiveProps(nextProps) {
    // console.log('Admin componentWillReceiveProps: ', nextProps);
    const { loginedUser, client } = nextProps;
    if (loginedUser) {
      const { id } = loginedUser;
      // console.log('Admin componentWillReceiveProps: ', id);
      const { data } = await client.query({
        query: gql`
          query IsAdmin($id: ID!) {
            isAdmin(id: $id)
          }
        `,
        variables: { id },
        fetchPolicy: 'network-only',
      });
      if (data) {
        this.setState({ isAdmin: data.isAdmin });
        // console.log('Admin componentWillReceiveProps: ', data);
      }
    }
  }

  render() {
    const { loginedUser, } = this.props;
    const { isAdmin } = this.state;
    if (!loginedUser || !isAdmin) return <RouteNotFound />;
    // console.log('Admin loginedUser: ', loginedUser);
    const { token, id } = loginedUser;

    return (
      <div>
        <div>
          <label>管理界面</label>
        </div>

        <div>
          <Tabs defaultActiveKey={KEY_REPORT} onChange={this.onChangeTab}>
            <TabPane tab="用户管理" key={KEY_USER}>
              <ManUsers operToken={token} adminid={id} />
            </TabPane>
            <TabPane tab="说说管理" key={KEY_SHUOSHUO}>
              {/* @2018-06-29 15:21:16 
              TODO:  这里userToken和operToken重复了 
              去掉 userToken */}
              <ManImage userToken={token} operToken={token} adminid={id} />
            </TabPane>
            <TabPane tab="举报管理" key={KEY_REPORT}>
              <ManReportImage operToken={token} adminid={id} />
            </TabPane>
          </Tabs>
        </div>

      </div>
    );
  }
}


// export default Admin;

export default compose(
  withApollo,
  withLocalLoginedUserQuery(),
)(Admin);

