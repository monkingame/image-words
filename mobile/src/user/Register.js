import React, { Component, PureComponent, } from 'react';
// import { connect } from 'react-redux';
import { Platform, StyleSheet, Text, TextInput, View, Button } from 'react-native';
import md5 from 'md5';
import { graphql, compose, withApollo } from "react-apollo";

// import { regProcessAsync, regReset, regFailure } from './actions';
// import { REDUCER_REG } from './reducer';
// import { verifyUsername, verifyPassword, verifyConfirmPassword } from './Util';
import withFormChecker from '../hoc/HOCFormChecker';
import { QUERY_USER_EXIST, QUERY_LOGIN, } from '../graphql/GQLQuery';
import { withMetadataQuery } from '../graphql/WithQuery';
import { MUT_ADD_USER, } from '../graphql/GQLMutation';
import { withMutLocalLoginedUser, } from '../graphql/WithMutation';
import { setLocalStorageLoginedUser } from './Util';
import { VARIABLES_CLIENT_IDENTIFY } from '../util/GlobalConst';
import { BUTTON_TYPE_REGISTER, } from '../components/button';
import { ButtonCommon } from '../components/button';


const MIN_LENGTH = 5;
const MAX_LENGTH = 32;
//目前只允许使用字符注册，保留@、数字等，以备后面的电子邮件和电话号码注册
const REGEX_USERNAME = /^[a-zA-Z]+$/;

class Register extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      repassword: '',
    };
  }

  // componentDidMount() {
  //   const { reset } = this.props;
  //   reset();
  // }

  handleRegister = async () => {
    // const { reg, failure } = this.props;
    // const { username, password, repassword } = this.state;
    // const verifyU = verifyUsername(username);
    // if (!verifyU.result) {
    //   failure(verifyU.err);
    //   return;
    // }
    // const verifyP = verifyPassword(password);
    // if (!verifyP.result) {
    //   failure(verifyP.err);
    //   return;
    // }
    // const verifyRe = verifyConfirmPassword(password, repassword);
    // if (!verifyRe.result) {
    //   failure(verifyRe.err);
    //   return;
    // }
    // reg({ username: username.toLowerCase(), password: md5(password) });
    const { username, password, repassword } = this.state;
    if (!this.checkUsername(username)) return;
    if (!this.checkPassword(password, repassword)) return;
    // if (!this.checkVerifyPassword(password, repassword)) return;
    // console.log('handleRegister start...');

    const { client, addUser, metadata, updateLoginedUser, } = this.props;
    const { data } = await client.query({
      query: QUERY_USER_EXIST,
      variables: { username },
      fetchPolicy: 'network-only'
    });
    const { userExist } = data;
    // console.log('handleRegister userExist: ', userExist);
    if (userExist) {
      // console.log('handleRegister userExist & will return: ', this.props);
      const { setErrorMsg, } = this.props.formChecker;
      setErrorMsg(`用户${username}已经存在`);
      return;
    }

    const result = await addUser({
      variables: {
        username,
        password: md5(password),
        ...VARIABLES_CLIENT_IDENTIFY,
      }
    });
    const user = result.data.addUser;

    await updateLoginedUser({
      variables: {
        loginedUser: user,
      }
    });
    setLocalStorageLoginedUser(user, metadata);

    //注册成功后，将注册用户加入到登录缓存列表中。
    // 否则 如果在注册前尝试登录不存在的用户假设为xxx，那么缓存会记住此用户xxx不存在，
    // 而用户注册成功xxx并准备登录，因为刚才缓存原因，不允许xxx登录
    client.writeQuery({
      query: QUERY_LOGIN,
      data: { login: user },
      variables: { username, password: md5(password) }
    });
  }

  checkUsername = (username) => {
    const { verifyNotEmpty, verifyMinLength, verifyMaxLength, verifyRegexPattern, setErrorMsg, } = this.props.formChecker;
    // console.log('checkUsername : ', verifyNotEmpty);
    if (!verifyNotEmpty(username, `用户名不能为空`)) return false;
    if (!verifyRegexPattern(username, REGEX_USERNAME, `用户名只能为字母（不区分大小写）`)) return false;
    if (!verifyMinLength(username, MIN_LENGTH, `用户名不能少于${MIN_LENGTH}字符`)) return false;
    if (!verifyMaxLength(username, MAX_LENGTH, `用户名不能多于${MAX_LENGTH}字符`)) return false;
    return true;
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

  // checkVerifyPassword = (password, repassword) => {
  //   const { verifyNotEmpty, verifyEqual, setErrorMsg, } = this.props.formChecker;
  //   if (!verifyEqual(password, repassword, `两次密码不符`)) return false;
  //   return true;
  // }

  onUsernameChange = (username) => {
    // console.log('onUsernameChange: ', this.props);
    // console.log('Register onUsernameChange: ', username);
    // const { failure } = this.props;
    // const { result, err } = verifyUsername(username);
    // failure(err);
    this.setState({ username });
    // const { verifyNotEmpty, verifyMinLength, verifyMaxLength, verifyRegexPattern, setErrorMsg, } = this.props.formChecker;
    this.checkUsername(username);
  }

  onPasswordChange = (password) => {
    // const { failure } = this.props;
    // const { result, err } = verifyPassword(password);
    // failure(err);
    this.setState({ password });
    this.checkPassword(password, this.state.repassword);
    // this.checkVerifyPassword(password, this.state.repassword);
  }

  onRePasswordChange = (repassword) => {
    // console.log('Register onPasswordChange: ', repassword);
    // const { failure } = this.props;
    // const { password } = this.state;
    // const { result, err } = verifyConfirmPassword(password, repassword);
    // failure(err);
    this.setState({ repassword });
    // this.checkVerifyPassword(this.state.password, repassword);
    this.checkPassword(this.state.password, repassword);
  }


  render() {
    //此处要进行大量判断，保证输入无误
    //（1）不能少于5个字符 （2）必须为字母 不能有其他字符（数字、特殊符合都不可 预留后续手机和邮件注册）
    return (
      <View style={styles.container}>
        <View style={{ flex: 5, }}>
          <Text style={{
            color: 'red', marginTop: 20,
            // flex: 1,
          }}>
            {this.props.formChecker.errmsg}
          </Text>

          <TextInput
            onChangeText={this.onUsernameChange}
            value={this.state.username}
            placeholder='用户名'
            autoCapitalize='none'
            style={styles.input}
          />
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
          {/* <Button
            onPress={this.handleRegister}
            title="注册"
          /> */}
          <ButtonCommon type={BUTTON_TYPE_REGISTER}
            onPress={this.handleRegister}
            text={"注册"}
          />
        </View>
      </View >
    );

  }
}

// export default RegisterContainer;
// export default withFormChecker(Register);
export default compose(
  withApollo,
  graphql(MUT_ADD_USER, {
    name: `addUser`,
  }),
  withMetadataQuery(),
  withMutLocalLoginedUser(),
)(withFormChecker(Register));


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor:'red',
    // marginVertical: 10,
  },
  input: {
    flex: 1,
    width: 200,
    // borderBottomColor: '#adadad',
    // borderBottomWidth: 1,
    marginVertical: 3,
  }
});

