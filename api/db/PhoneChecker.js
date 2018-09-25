
// 手机号码校验
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schemaPhoneChecker = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: 'user', },
  // NOTE: 不再需要电话号码 已经存在于user表中 没必要重复 而且还要维护同步 多此一举
  // phone: {
  //   type: String,
  //   // 电话号码是唯一的，防止一个号码被不同的用户使用
  //   unique: true,
  //   // TODO: 注意 这里有个索引
  //   index: true,
  // },
  // 验证码
  code: String,
  counter: { type: Number, default: 0, },
}, {
    timestamps: true,
    collection: 'phoneChecker',
  }
);

mongoose.model('phoneChecker', schemaPhoneChecker);
