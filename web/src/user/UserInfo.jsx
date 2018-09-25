import React, { Component } from 'react';
import { compose, } from "react-apollo";

import { withLocalLoginedUserQuery } from '../graphql/WithQuery';
import ChangePassword from './ChangePassword';

class UserInfo extends Component {
  render() {
    const { loginedUser } = this.props;
    if (!loginedUser) return null;

    return (
      <div>
        {"你好：" + loginedUser.username}
        <br />
        <ChangePassword />
      </div>
    );
  }
}


export default compose(
  withLocalLoginedUserQuery(),
)(UserInfo);

