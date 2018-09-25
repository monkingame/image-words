import React, { Component, PureComponent, } from 'react';
import md5 from 'md5';
// import 'antd/dist/antd.css';
// import { Form, Input, Button, Row, Col, message } from 'antd';
import { graphql, compose, withApollo } from "react-apollo";
import { Platform, StyleSheet, Text, TextInput, View, Button, Alert } from 'react-native';

// import './User.css';

import { QUERY_LOGIN, } from '../graphql/GQLQuery';
// import { withMetadataQuery } from '../graphql/WithQuery';
import { MUT_CHANGE_PASSWORD, } from '../graphql/GQLMutation';
// import { withMutLocalLoginedUser, } from '../graphql/WithMutation';
// import { setLocalStorageLoginedUser } from '../util/LocalStore';
// import { VARIABLES_CLIENT_IDENTIFY } from '../util/GlobalConst';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';
import withFormChecker from '../hoc/HOCFormChecker';
import { BUTTON_TYPE_EDIT, } from '../components/button';
import { ButtonCommon } from '../components/button';

// const FormItem = Form.Item;

const MIN_LENGTH = 5;
const MAX_LENGTH = 32;
// //目前只允许使用字符注册，保留@、数字等，以备后面的电子邮件和电话号码注册
// const REGEX_USERNAME = /^[a-zA-Z]+$/;


class ChangePassword extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      repassword: '',
    };
  }

  handleRegister = async () => {
    const { loginedUser } = this.props;
    if (!loginedUser) {
      Alert.alert(`请先登录`);
      return;
    };

    const { password, repassword } = this.state;
    if (!this.checkPassword(password, repassword)) return;

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

    if (user) {
      // this.props.form.resetFields();
      this.clearInput();
      // message.success('密码修改完成');
      Alert.alert('密码修改完成');
    }

    client.writeQuery({
      query: QUERY_LOGIN,
      data: { login: user },
      variables: { username, password: md5(password), }
    });

  }

  clearInput = () => {
    this.setState({ password: '' });
    this.setState({ repassword: '' });
  }

  checkPassword = (password, repassword) => {
    const { verifyNotEmpty, verifyMinLength, verifyMaxLength, verifyRegexPattern, verifyEqual, setErrorMsg, } = this.props.formChecker;
    if (!verifyNotEmpty(password, `密码不能为空`)) return false;
    if (!verifyMinLength(password, MIN_LENGTH, `密码不能少于${MIN_LENGTH}字符`)) return false;
    if (!verifyMaxLength(password, MAX_LENGTH, `密码不能多于${MAX_LENGTH}字符`)) return false;
    if (!verifyEqual(password, repassword, `两次密码不符`)) return false;
    if (!verifyNotEmpty(repassword, `再次密码不能为空`)) return false;
    if (!verifyMinLength(repassword, MIN_LENGTH, `再次密码不能少于${MIN_LENGTH}字符`)) return false;
    if (!verifyMaxLength(repassword, MAX_LENGTH, `再次密码不能多于${MAX_LENGTH}字符`)) return false;
    return true;
  }

  onPasswordChange = (password) => {
    this.setState({ password });
    this.checkPassword(password, this.state.repassword);
  }

  onRePasswordChange = (repassword) => {
    this.setState({ repassword });
    this.checkPassword(this.state.password, repassword);
  }


  render() {
    const { loginedUser } = this.props;
    if (!loginedUser) return null;

    return (
      <View style={styles.container}>
        <View style={{ flex: 3, alignItems: 'center', justifyContent: 'center', }}>
          <Text>{"修改密码"}</Text>

          <Text style={{
            color: 'red', marginTop: 20,
          }}>
            {this.props.formChecker.errmsg}
          </Text>

          <TextInput
            onChangeText={this.onPasswordChange}
            value={this.state.password}
            placeholder='密码'
            autoCapitalize='none'
            style={styles.input}
            secureTextEntry={true}
          />
          <TextInput
            onChangeText={this.onRePasswordChange}
            value={this.state.repassword}
            placeholder='再次输入密码'
            autoCapitalize='none'
            style={styles.input}
            secureTextEntry={true}
          />

        </View>

        <View style={{
          marginVertical: 10, width: 150,
          flex: 1,
        }}>
          <ButtonCommon type={BUTTON_TYPE_EDIT}
            onPress={this.handleRegister}
            text={"修改密码"}
          />
        </View>
      </View >
    );

  }
}


export default compose(
  withApollo,

  graphql(MUT_CHANGE_PASSWORD, {
    name: `changePassword`,
  }),

  // withMetadataQuery(),
  withLocalLoginedUserQuery(),
  // withMutLocalLoginedUser(),
)(withFormChecker(ChangePassword));


const styles = StyleSheet.create({
  container: {
    // TODO:由于设置了绝对高度，所以不能再flex为1，否则就填充整个页面，很难看
    // flex: 1,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fefeef',
    borderRadius: 12,
    // marginVertical: 10,
    // borderWidth: 1,
  },
  input: {
    flex: 1,
    width: 200,
    // borderBottomColor: '#adadad',
    // borderBottomWidth: 1,
    marginVertical: 3,
  }
});


