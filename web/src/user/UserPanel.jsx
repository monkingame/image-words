import React, { Component } from 'react';
import { compose, } from "react-apollo";
import { Button } from 'antd';
import 'antd/dist/antd.css';
// import { Link } from 'react-router-dom';
// import { Layout, Menu, Breadcrumb, Row, Col, Avatar, Button } from 'antd';
// const { Header, Content, Footer } = Layout;

import Login from './Login';
import Logout from './Logout';
import Register from './Register';
import UserInfo from './UserInfo';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';


class UserPanel extends Component {

  constructor(props) {
    super(props);
    //true:login , false:register
    this.state = { showSwitch: true };
  }

  // onDispRegister = () => {
  //   this.setState({ showSwitch: false });
  // }

  // onDispLogin = () => {
  //   this.setState({ showSwitch: true });
  // }

  render() {
    // const { userid } = this.props;
    const { loginedUser } = this.props;
    // console.log('User: ', loginedUser);


    let content = null;
    // if (userid) {
    if (loginedUser) {
      content = (
        <div>
          <UserInfo />
          <Logout />
        </div>
      );
    } else {
      if (this.state.showSwitch) {
        content = (
          <div>
            {/* <LoginStatusContainer /> */}
            <Login />
            {/* <Button icon="user-add" style={{ fontSize: 12, color: '#08c' }} ghost onClick={this.onDispRegister}> */}
            <Button icon="user-add" style={{ fontSize: 12, color: '#08c' }} ghost onClick={() => { this.setState({ showSwitch: false }); }}>
              {"没有账户？注册一个"}
            </Button>
          </div>
        );
      } else {
        content = (
          <div>
            {/* <RegisterStatusContainer /> */}
            <Register />
            {/* <Button icon="login" style={{ fontSize: 12, color: '#08c' }} ghost onClick={this.onDispLogin}> */}
            <Button icon="login" style={{ fontSize: 12, color: '#08c' }} ghost onClick={() => { this.setState({ showSwitch: true }); }}>
              {"已有账户登录"}
            </Button>
          </div>
        );
      }
    }

    return (
      <div>
        {content}
      </div>
    );

  }
}


export default compose(
  withLocalLoginedUserQuery(),
)(UserPanel);

