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
const Image = mongoose.model('image');
const Word = mongoose.model('word');
const PhoneChecker = mongoose.model('phoneChecker');

const { EncryptAESServer, DecryptAESServer } = require('../../util/crypto');

const UserType = require('../type/User');
const ImageType = require('../type/Image');
const WordType = require('../type/Word');
const { InputMetaIdentify, isLegalClientId } = require('../query/QueryMeta');
const { listLegalAdmin } = require('../../util/files');
const { isValidPhone } = require('../../util/userinfo');

///////////////////////////////////
//mutation

// TODO:防止多次提及 并且防止用户拿到此接口 任意添加用户
// TODO:可以在客户端加上一个标示 让客户端不能随意发生 metadata的key可以考虑
const addUser = {
  type: UserType,
  args: {
    username: { type: new GraphQLNonNull(GraphQLString) },
    // TODO: 注意 此时传过来的password 其实是MD5值
    password: { type: new GraphQLNonNull(GraphQLString) },
    // admin: { type: GraphQLBoolean },//添加用户时不能指定admin，只能是管理员后期修改
    clientId: { type: new GraphQLNonNull(InputMetaIdentify) },
  },
  async resolve(parentValue, { username, password, clientId, }) {
    if (!isLegalClientId(clientId)) return null;

    const user = new User({
      username,
      // NOTE: password是MD5值
      password: EncryptAESServer(password),
    });
    await user.save();
    return user;
  }
};

// 更新用户电话号码
const updateUserPhone = {
  type: UserType,
  args: {
    userToken: { type: new GraphQLNonNull(GraphQLString) },
    phone: { type: new GraphQLNonNull(GraphQLString) },
    // email: { type: GraphQLString },
  },
  async resolve(parentValue, params) {
    const { userToken, phone } = params;
    // 对电话号码进行校验
    if (!isValidPhone(phone)) {
      return null;
    }

    const user = await User.checkToken(userToken);
    if (!user) return null;
    // 不需要更新
    if (phone === user.phone) return user;

    const { id } = user;
    // 查询是否有人已经使用了电话号码
    // TODO: 不应该直接读取电话号码 而且应该去掉unique的属性
    // 应该查询phone phoneVerifyied===true ； 才能作为是否被人占用的条件
    const exist = await User.findOne({ phone, _id: { $ne: id } });
    // console.log('MutUser updateUserPhone duplicate phone: ', exist);
    if (exist) return null;

    //注意：如果直接用属性，那么set 很可能把原来的信息覆盖为undefined/null
    //比如email没有输入 那么传入的值就为undefined/null（经实际测试，空值为null）
    //使用展开属性 就可以了
    // TODO: 注意 这段注释是以前的做法
    // const { userToken, ...values } = params;
    // 然后根据values在做判断 现在已经没用了

    return await User.findByIdAndUpdate(id, {
      $set: {
        phone,
        // 更新了电话号码 必须要重新认证
        phoneVerified: false,
      }
    }, { new: true });
  }
};

// TODO: 验证码有效期 改成15分钟
const CODE_VALID_PERIOD = 15 * 60 * 1000;

// 验证电话号码
const verifyUserPhone = {
  type: UserType,
  args: {
    userToken: { type: new GraphQLNonNull(GraphQLString) },
    code: { type: new GraphQLNonNull(GraphQLString) },
  },
  async resolve(parentValue, params) {
    const { userToken, code } = params;
    const user = await User.checkToken(userToken);
    if (!user) return null;
    const { phone } = user;
    // 对电话号码进行校验
    if (!isValidPhone(phone)) {
      return null;
    }

    const { id } = user;
    const phoneChecker = await PhoneChecker.findOne({ owner: id, });
    if (!phoneChecker) return null;

    // TODO: 判断code有效期
    const last = Date.now() - Date.parse(phoneChecker.updatedAt);
    if (last > CODE_VALID_PERIOD) {
      // console.log('MutUser verifyUserPhone 验证码超出了有效期: ');
      return null;
    }

    const verified = (code === phoneChecker.code);
    if (!verified) {
      // console.log('MutUser verifyUserPhone 验证码无效: ', code, phoneChecker.code);
      return null;
    }

    const finished = await User.findByIdAndUpdate(id,
      { $set: { phoneVerified: verified } },
      { new: true });

    // 更新完毕 要重置code 防止被再次利用
    phoneChecker.code = '';
    await phoneChecker.save();

    return finished;
  }
};

//modify password
const changePassword = {
  type: UserType,
  args: {
    token: { type: new GraphQLNonNull(GraphQLString) },
    id: { type: new GraphQLNonNull(GraphQLID) },
    password: { type: new GraphQLNonNull(GraphQLString) },
  },
  async resolve(parentValue, { token, id, password }) {
    // if (!DecryptAESClient(pwdCipher)) return null;

    //判断token和id是否相等，或者管理员也可
    const user = await User.checkToken(token);
    if (!user) return null;
    if (!user.admin && (user.id !== id)) return null;

    return await User.findByIdAndUpdate(id,
      { $set: { password: EncryptAESServer(password) } },
      { new: true }
    );
  }
};

//promote user to admin 将用户提升为管理员
const promoteAdmin = {
  type: UserType,
  args: {
    operToken: { type: new GraphQLNonNull(GraphQLString) },
    id: { type: new GraphQLNonNull(GraphQLID) },
    admin: { type: new GraphQLNonNull(GraphQLBoolean) },
  },
  async resolve(parentValue, { operToken, id, admin }) {
    //判断token和id是否相等，或者管理员也可
    const oper = await User.checkToken(operToken);
    if (!oper) return null;
    if (!oper.admin) return null;

    const promote = await User.findOne({ _id: id });
    if (!promote) return null;

    // 从config/admin.cfg中查询，是否在admin列表（如果不是，则不予以提升admin权限）
    const listAdmin = listLegalAdmin;
    if (!listAdmin) return promote;

    if (listAdmin.includes(promote.username)) {
      promote.admin = admin;
      await promote.save();
    }
    // console.log('promoteAdmin promote: ', promote);

    return promote;
  }
};


// @2018-06-28 15:36:32
// 删除用户
const delUser = {
  type: UserType,
  args: {
    // 操作用户token 一般为管理员
    operToken: { type: new GraphQLNonNull(GraphQLString) },
    // 欲删除用户的id
    id: { type: new GraphQLNonNull(GraphQLID) },
    deleted: { type: new GraphQLNonNull(GraphQLBoolean) },
  },
  async resolve(parentValue, { operToken, id, deleted }) {
    const oper = await User.checkToken(operToken);
    if (!oper || !oper.admin) return null;

    // @2018-06-30 11:59:40
    // TODO: 是否加入 自身无法删除自己的ID

    const delUser = await User.findOneAndUpdate(
      { _id: id, },
      { $set: { deleted } },
      { new: true },
    );
    if (!delUser) return null;
    await delUser.save();

    return delUser;
  }
};



module.exports = {
  addUser, delUser,
  updateUserPhone, verifyUserPhone, changePassword,
  promoteAdmin,
};
