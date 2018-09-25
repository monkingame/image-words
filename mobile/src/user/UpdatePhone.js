import React, { Component, PureComponent, } from 'react';
import md5 from 'md5';
import { graphql, compose, withApollo } from "react-apollo";
import { Platform, StyleSheet, Text, TextInput, View, Alert, } from 'react-native';

// import { QUERY_LOGIN, } from '../graphql/GQLQuery';
import { MUT_UPDATE_USER_PHONE, MUT_VERIFY_USER_PHONE, } from '../graphql/GQLMutation';
import { withMetadataQuery } from '../graphql/WithQuery';
import { withLocalLoginedUserQuery } from '../graphql/WithQuery';
import { withMutLocalLoginedUser, } from '../graphql/WithMutation';
import { QUERY_USER_BY_TOKEN, } from '../graphql/GQLQuery';
import { QUERY_SMS_VERIFY_CODE, } from '../graphql/GQLQuery';
import withFormChecker from '../hoc/HOCFormChecker';
import { BUTTON_TYPE_EDIT, BUTTON_TYPE_PHONE_MSG, BUTTON_TYPE_CHECK, } from '../components/button';
import { ButtonCommon } from '../components/button';
import { getLocalStorageLoginedUser, setLocalStorageLoginedUser } from './Util';


const PHONE_LENGTH = 11;
const VERIFY_CODE_LENGTH = 10;
// 目前只支持11位手机号码
// const REGEX_PHONE = /^\d{11}$/;
const REGEX_PHONE = /^1[3-9]\d{9}$/;

class UpdatePhone extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // 用户输入的电话
      phone: '',
      // 用户输入的校验码
      code: '',
      // 用户信息
      userByToken: null,
    };
  }

  async componentDidMount() {
    // console.log('UpdatePhone componentDidMount');
    const { client, token, } = this.props;
    if (!client || !token) return;
    const { data } = await client.query({
      query: QUERY_USER_BY_TOKEN,
      variables: { token },
    });
    if (!data) return;
    const { userByToken } = data;
    // console.log('UpdatePhone componentDidMount: ', userByToken);
    if (!userByToken) return;

    this.setState({
      userByToken,
      phone: userByToken.phone,
    });

  }

  handleUpdate = async () => {
    const { client, updateUserPhone, token, } = this.props;

    const { userByToken, phone, } = this.state;
    if (!userByToken) return;
    if (!this.checkPhone(phone)) return;

    const { setErrorMsg, } = this.props.formChecker;

    if (phone === userByToken.phone) {
      setErrorMsg(`手机号码修改完成`);
      return;
    }

    const result = await updateUserPhone({
      variables: {
        userToken: token,
        phone,
      }
    });
    const user = result.data.updateUserPhone;
    if (!user) {
      setErrorMsg(`无法更新：号码错误或已被使用`);
      return;
    }
    // console.log('UpdatePhone handleUpdate: ', user);


    // client.writeQuery({
    //   query: QUERY_USER_BY_TOKEN,
    //   data: { userByToken: user },
    //   variables: { token },
    // });

    // // updateLoginedUser({
    // //   variables: {
    // //     loginedUser: user,
    // //   }
    // // });
    // setLocalStorageLoginedUser(user, metadata);

    // 提取为独立函数
    this.saveCache(user);


    this.setState({ userByToken: user });

    // Alert.alert('手机号码修改完成');
    setErrorMsg(`手机号码修改完成`);

  }

  // 保存当前用户到缓存 包括本地存储缓存
  saveCache = (user) => {
    if (!user) return;
    const { client, metadata, } = this.props;
    if (!metadata) return;

    client.writeQuery({
      query: QUERY_USER_BY_TOKEN,
      data: { userByToken: user },
      variables: { token: user.token },
    });

    // updateLoginedUser({
    //   variables: {
    //     loginedUser: user,
    //   }
    // });

    setLocalStorageLoginedUser(user, metadata);
  }

  checkPhone = (phone) => {
    const { verifyNotEmpty, verifyLength, verifyRegexPattern, } = this.props.formChecker;
    if (!verifyNotEmpty(phone, `电话号码不能为空`)) return false;
    if (!verifyRegexPattern(phone, REGEX_PHONE, `只能11位有效手机号码`)) return false;
    if (!verifyLength(phone, PHONE_LENGTH, `目前只支持${PHONE_LENGTH}位手机号码`)) return false;
    return true;
  }

  onPhoneChange = (phone) => {
    const { clearErrorMsg, } = this.props.formChecker;
    clearErrorMsg();

    this.setState({ phone });
    this.checkPhone(phone);
  }

  onCodeChange = (code) => {
    this.setState({ code });
  }

  fetchVerifyCode = async () => {
    const { client, } = this.props;
    const { setErrorMsg, } = this.props.formChecker;
    const { userByToken, } = this.state;
    // if (!userByToken || !userByToken.phone) return;
    if (!userByToken) return;

    const { data } = await client.query({
      query: QUERY_SMS_VERIFY_CODE,
      variables: {
        userToken: userByToken.token,
        // phone: userByToken.phone,
      },
      fetchPolicy: 'network-only',
    });
    if (!data) return;
    const { getSMSVerifyCode } = data;
    // console.log('UpdatePhone getSMSVerifyCode: ', getSMSVerifyCode);
    if (getSMSVerifyCode !== 'OK') {
      setErrorMsg(getSMSVerifyCode);
    }
  }

  verifyPhoneCode = async () => {
    const { client, verifyUserPhone, } = this.props;
    const { setErrorMsg, } = this.props.formChecker;
    const { userByToken, code, } = this.state;
    if (!userByToken || !code) return;

    const result = await verifyUserPhone({
      variables: {
        userToken: userByToken.token,
        code,
      }
    });
    const user = result.data.verifyUserPhone;
    if (!user) {
      setErrorMsg(`验证码无效或过期`);
      return;
    }

    // 提取为独立函数
    this.saveCache(user);

    this.setState({ userByToken: user });

    // console.log('UpdatePhone verifyPhoneCode: ', user);
    if (user.phoneVerified) {
      setErrorMsg(`验证成功`);
    } else {
      setErrorMsg(`验证失败`);
    }

  }


  render() {
    const { userByToken } = this.state;
    if (!userByToken) return null;
    // console.log('UpdatePhone userByToken: ', userByToken);

    return (
      <View style={styles.container}>
        <View style={styles.head}>
          <Text>{"更新手机"}</Text>
          <Text style={styles.errmsg}>
            {this.props.formChecker.errmsg}
          </Text>
        </View>

        <View style={styles.body}>
          <View style={styles.updatePhone}>
            <View>
              <TextInput
                onChangeText={this.onPhoneChange}
                value={this.state.phone}
                placeholder='请输入11位手机号码'
                autoCapitalize='none'
                style={styles.inputPhone}
                maxLength={PHONE_LENGTH}
              />
            </View>

            <View>
              <ButtonCommon type={BUTTON_TYPE_EDIT}
                onPress={this.handleUpdate}
                text={"更新"}
              />
            </View>
          </View>


          {userByToken.phoneVerified
            ? null
            : (<View style={styles.verifyPhone}>
              <View style={{ flex: 1 }}>
                <ButtonCommon type={BUTTON_TYPE_PHONE_MSG}
                  onPress={this.fetchVerifyCode}
                  text={"获取验证码"}
                />
              </View>
              <View style={{ flex: 1, flexDirection: 'row', }}>
                <TextInput
                  onChangeText={this.onCodeChange}
                  value={this.state.code}
                  placeholder='请输入短信验证码'
                  autoCapitalize='none'
                  style={styles.inputPhone}
                  maxLength={VERIFY_CODE_LENGTH}
                />
                <ButtonCommon type={BUTTON_TYPE_CHECK}
                  onPress={this.verifyPhoneCode}
                  text={"校验"}
                />
              </View>
            </View>)}


        </View>
      </View >
    );

  }
}


export default compose(
  withApollo,
  withMetadataQuery(),

  withMutLocalLoginedUser(),


  graphql(MUT_UPDATE_USER_PHONE, {
    name: `updateUserPhone`,
  }),

  graphql(MUT_VERIFY_USER_PHONE, {
    name: `verifyUserPhone`,
  }),

  // TODO: FUCK
  // 这里竟然有无限循环调用的bug！！！
  // 只能在componentDidMount里面单次调用了
  // graphql(QUERY_USER_BY_TOKEN, {
  //   name: `userByToken`,
  //   options: ({ token }) => ({ variables: { token, } }),
  // }),

  // withLocalLoginedUserQuery(),
)(withFormChecker(UpdatePhone));


const styles = StyleSheet.create({
  container: {
    flex: 1,
    // height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fefeef',
    borderRadius: 12,
    // borderWidth: 1,
  },
  head: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errmsg: {
    color: 'red',
    // borderWidth: 1,
  },
  body: {
    flex: 1,
  },
  updatePhone: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#DBDBDBCC',
  },
  verifyPhone: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#DBDBDBCC',
  },
  inputPhone: {
    flex: 1,
    width: 180,
    // borderBottomColor: '#adadad',
    // borderBottomWidth: 1,
    // marginVertical: 3,
  },
});


