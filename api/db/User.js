const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//TODO:client端的token 应该用cilent key加密，不要使用服务器端key
const { EncryptAESServer, DecryptAESServer, } = require('../util/crypto');

const schemaUsers = new Schema({
  username: {
    type: String,
    // TODO: 注意 这里有个索引
    index: true, unique: true,
    required: true,
    trim: true, lowercase: true,//用户名小写
  },
  password: String,
  // images: [{ type: Schema.Types.ObjectId, ref: 'image' }],
  // words: [{ type: Schema.Types.ObjectId, ref: 'word' }],
  email: String,//[String]
  phone: {
    type: String,
    unique: true,
  },
  phoneVerified: { type: Boolean, default: false },
  admin: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
}, {
    timestamps: true,
    collection: 'user',
  }
);

// NOTE:
// 此处不要用箭头函数
// 因为箭头函数里面的this指向js类（自动绑定了）
// 用常规ES函数 this指向的是user model
schemaUsers.virtual('token').get(function () {
  // console.log('virtual');
  return EncryptAESServer(JSON.stringify({
    id: this.id,
    time: Date.now()
  }));
});


schemaUsers.statics.login = async function (username, password) {
  const user = await this.findOne({ username, deleted: false });
  if (!user) return null;

  return (DecryptAESServer(user.password) === password) ? user : null;
}


//NOTE:注意，返回的信息是{ deleted: false, _id: 5ab8a382c87b683b8c680583 }
//也即 key为_id而不是id，
//或许是Query的原因，如果只是model，那么应该有virtual id
//但是实际结果是存在virtual id的！
schemaUsers.statics.checkToken = async function (token) {
  try {
    const { id, time } = JSON.parse(DecryptAESServer(token));
    //返回所有user信息最好，如果判断删除标志的话就是：findById(id, 'deleted')
    // console.log('checkToken: ', id, time);
    return await this.findOne({ _id: id, deleted: false });
  } catch (ex) {
    // console.log(ex);
    return null;
  }
}



mongoose.model('user', schemaUsers);

