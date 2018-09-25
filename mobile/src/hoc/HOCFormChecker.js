import React, { Component } from 'react';

// const MIN_LENGTH = 5;
// const MAX_LENGTH = 32;
// //目前只允许使用字符注册，保留@、数字等，以备后面的电子邮件和电话号码注册
// const REGEX_USERNAME = /^[a-zA-Z]+$/;


export default function withFormChecker(WrappedComponent, ) {
  return class WrappedFormChecker extends Component {
    constructor(props) {
      super(props);
      this.state = {
        errmsg: '',
      };
    }

    clearErrorMsg = () => {
      this.setState({ errmsg: '' });
    }

    setErrorMsg = (errmsg) => {
      // console.log('withFormChecker setErrorMsg: ', errmsg);
      this.setState({ errmsg });
    }

    verifyNotEmpty = (input, errmsg) => {
      // console.log('verifyNotEmpty: ', input, errmsg);
      if (!input || input.length <= 0) {
        this.setState({ errmsg });
        return false;
      }
      // this.setState({ errmsg: '' });
      this.clearErrorMsg();
      return true;
    }

    verifyMinLength = (input, min, errmsg) => {
      if (!this.verifyNotEmpty(input)) return false;
      if (input.length < min) {
        this.setState({ errmsg });
        return false;
      }
      // this.setState({ errmsg: '' });
      this.clearErrorMsg();
      return true;
    }

    verifyMaxLength = (input, max, errmsg) => {
      if (!this.verifyNotEmpty(input)) return false;
      if (input.length > max) {
        this.setState({ errmsg });
        return false;
      }
      // this.setState({ errmsg: '' });
      this.clearErrorMsg();
      return true;
    }

    verifyLength = (input, length, errmsg) => {
      if (!this.verifyNotEmpty(input)) return false;
      if (input.length !== length) {
        this.setState({ errmsg });
        return false;
      }
      this.clearErrorMsg();
      return true;
    }

    verifyRegexPattern = (input, pattern, errmsg) => {
      if (!this.verifyNotEmpty(input)) return false;
      if (!pattern) return false;

      if (!pattern.test(input)) {
        this.setState({ errmsg });
        return false;
      }
      // this.setState({ errmsg: '' });
      this.clearErrorMsg();
      return true;
    }

    verifyEqual = (input1, input2, errmsg) => {
      if (input1 !== input2) {
        this.setState({ errmsg });
        return false;
      }
      this.clearErrorMsg();
      return true;
    }

    render() {
      return <WrappedComponent
        formChecker={{
          errmsg: this.state.errmsg,
          verifyNotEmpty: this.verifyNotEmpty,
          verifyMinLength: this.verifyMinLength,
          verifyMaxLength: this.verifyMaxLength,
          verifyLength: this.verifyLength,
          verifyRegexPattern: this.verifyRegexPattern,
          verifyEqual: this.verifyEqual,
          setErrorMsg: this.setErrorMsg,
          clearErrorMsg: this.clearErrorMsg,
        }}
        {...this.props}
      />;
    }
  };
}


// const verifyUsername = (username) => {
//   if (!username) return { err: '用户名不能为空', checked: false };
//   if (!REGEX_USERNAME.test(username)) return { err: `用户名只能为字母（不区分大小写）`, checked: false };
//   if (username.length < MIN_LENGTH) return { err: `用户名不能少于${MIN_LENGTH}字符`, checked: false };
//   if (username.length > MAX_LENGTH) return { err: `用户名不能多于${MAX_LENGTH}字符`, checked: false };
//   return { err: null, checked: true };
// }

// const verifyPassword = (password) => {
//   if (!password) return { err: '密码不能为空', checked: false };
//   if (password.length < MIN_LENGTH) return { err: `密码不能少于${MIN_LENGTH}字符`, checked: false };
//   if (password.length > MAX_LENGTH) return { err: `密码不能多于${MAX_LENGTH}字符`, checked: false };
//   return { err: null, checked: true };
// }

// const verifyConfirmPassword = (password1, password2) => {
//   if (password1 !== password2) return { err: `两次密码不一致`, checked: false };
//   return { err: null, checked: true };
// }

