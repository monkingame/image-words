
const graphql = require('graphql');
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
  isOutputType,
} = graphql;

const mongoose = require('mongoose');
const User = mongoose.model('user');
const PhoneChecker = mongoose.model('phoneChecker');

const SMSClient = require('@alicloud/sms-sdk');
const { isValidPhone } = require('../../util/userinfo');

const smsClient = new SMSClient({
  accessKeyId: process.env.SMS_KEY_ID,
  secretAccessKey: process.env.SMS_KEY_SECRET
});


const genRandomVerifyCode = () => {
  const str = `${Math.floor(Math.random() * 1000000)}`;
  return str.padStart(6, '0');
}


const RESULT_OK = 'OK';
// 一个用户 每天最多发送短信2次
// 对于每个电话号码的，ALI sms系统自动管理
// 使用同一个签名，对同一个手机号码发送短信验证码，支持1条/分钟，5条/小时 ，累计10条/天
const MAX_TIMES_PERDAY = 2;
// 一天的毫秒数
const MILLI_ONE_DAY = 24 * 60 * 60 * 1000;

const genResMsg = (msg) => {
  // const info = { code: 1, msg, }
  // return JSON.stringify(info);
  return msg;
}

// 阿里SMS短信服务
// https://www.npmjs.com/package/@alicloud/sms-sdk?spm=a2c4g.11186623.2.8.A8gtVR

const getSMSVerifyCode = {
  type: GraphQLString,
  args: {
    userToken: { type: new GraphQLNonNull(GraphQLString) },
  },

  resolve: async (parentValue, { userToken, }) => {
    const user = await User.checkToken(userToken);
    if (!user) return genResMsg('无效用户');
    const { phone } = user;
    if (!isValidPhone(phone)) return genResMsg('手机号码无效');

    let phoneChecker = await PhoneChecker.findOne({ owner: user.id, });
    if (!phoneChecker) {
      phoneChecker = new PhoneChecker({
        owner: user.id,
      });
      await phoneChecker.save();
    }
    // console.log('QueryAliSMS phoneChecker: ', phoneChecker);

    // 每天只允许两次短信验证 （无论几个手机，每个用户每天只能2次）
    const last = Date.now() - Date.parse(phoneChecker.updatedAt);
    // console.log('QueryAliSMS phoneChecker last: ', last);
    if (last < MILLI_ONE_DAY) {
      // 未超出一天
      if (phoneChecker.counter >= MAX_TIMES_PERDAY) {
        return genResMsg('每天最多发送2次短信');
      }
    } else {
      // 已经超出一天了
      phoneChecker.counter = 0;
      await phoneChecker.save();
    }

    const code = genRandomVerifyCode();
    // console.log('QueryAliSMS getSMSVerifyCode code: ', code);
    const TemplateParam = JSON.stringify({ code });

    const smsInfo = {
      PhoneNumbers: phone,
      SignName: process.env.SMS_SIGN_NAME,
      TemplateCode: process.env.SMS_TEMPLATE_CODE,
      TemplateParam,
    };
    // console.log('QueryAliSMS getSMSVerifyCode smsInfo: ', smsInfo);

    try {
      // TODO: 假设已经正常发送了短信
      const result = await smsClient.sendSMS(smsInfo);

      // console.log('QueryAliSMS getSMSVerifyCode result: ', result);

      phoneChecker.code = code;
      phoneChecker.counter = phoneChecker.counter + 1;
      await phoneChecker.save();
    } catch (ex) {
      // console.log('QueryAliSMS getSMSVerifyCode err: ', ex);
      return genResMsg('验证短信系统错误');
    }

    return genResMsg(RESULT_OK);
  }
};


module.exports = {
  getSMSVerifyCode,
};

