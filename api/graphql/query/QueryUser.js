
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

// const { EncryptAESClient, DecryptAESClient } = require('../../util/crypto');

const UserType = require('../type/User');
const ImageType = require('../type/Image');
const WordType = require('../type/Word');

const { isAdminToken } = require('./Util');
const logger = require("../../util/logger");

/////////////////////////
//query

// //TODO:应该禁止
// //TODO:继续用分页方式
// const users = {
//   type: new GraphQLList(UserType),
//   resolve() {
//     return User.find({ deleted: false });
//   }
// };

const moreUsers = {
  type: new GraphQLList(UserType),
  args: {
    operToken: { type: new GraphQLNonNull(GraphQLString) },
    offset: { type: new GraphQLNonNull(GraphQLInt) },
    limit: { type: new GraphQLNonNull(GraphQLInt) },
  },
  async resolve(parentValue, { offset, limit, operToken }) {
    const isAdmin = await isAdminToken(operToken);
    if (!isAdmin) return null;

    // @2018-06-28 16:30:48

    // return await User
    //   .find(
    //     {},// { deleted: false },
    //     {}, { skip: offset, limit: limit })
    //   .sort({ "_id": -1 });

    const user = await User
      .find(
        {},
        {}, { skip: offset, limit: limit })
      .sort({ "_id": -1 });
    return user;
  }
};

const usersCount = {
  type: GraphQLInt,
  args: {
    operToken: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (parentValue, { operToken }) => {
    const isAdmin = await isAdminToken(operToken);
    if (!isAdmin) return 0;

    const count = await User.count({});
    return count;
  }
};

const user = {
  type: UserType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    operToken: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (parentValue, { id, operToken, }) => {
    // console.log('user operToken : ', operToken);
    const isAdmin = await isAdminToken(operToken);
    if (!isAdmin) return null;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      // console.log('QueryUser user not valid id: ', id);
      return null;
    }

    // return User.findById(id);
    // return User.findOne({ _id: id, deleted: false });
    // @2018-06-29 09:55:41
    // 这里将deleted: false标志去掉
    // 因为此查询已经被管理员使用了，只要提供管理员token，就可以查找用户，当然包括已经删除的
    return User.findOne({ _id: id, });
  }
};

const isAdmin = {
  type: GraphQLBoolean,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  async resolve(parentValue, { id }) {
    const user = await User.findOne({ _id: id, deleted: false });
    // console.log('isAdmin: ',user);
    if (!user) return false;
    return user.admin;
  }
};

//NOTE:改为根据用户名判断是否存在
// const userByName = {
//   type: UserType,
//   args: { username: { type: new GraphQLNonNull(GraphQLString) } },
//   resolve(parentValue, { username }) {
//     return User.findOne({ username });
//   }
// };
const userExist = {
  type: GraphQLBoolean,
  args: { username: { type: new GraphQLNonNull(GraphQLString) } },
  resolve: async (parentValue, { username }) => {
    // return !!User.findOne({ username });
    const exist = await User.findOne({ username, deleted: false });
    // console.log(exist);
    return exist ? true : false;
    // return await User.findOne({ username });
  }
};


const login = {
  // type: TokenType,
  type: UserType,
  args: {
    username: { type: new GraphQLNonNull(GraphQLString) },
    // pwdCipher: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
  },
  // resolve: async (parentValue, { username, pwdCipher }) => {
  //   return await User.login(username, pwdCipher);
  // },
  resolve: async (parentValue, { username, password }) => {
    // return await User.login(username, password);
    const user = await User.login(username, password);
    logger.info(`QueryUser login: 用户以 ${username} 登录: ` + (user ? `成功` : `失败`));
    return user;
  },
}

const logout = {
  type: UserType,
  args: {
    userToken: { type: GraphQLString },
  },
  resolve: async (parentValue, { userToken }) => {
    if (!userToken) return null;
    const user = await User.checkToken(userToken);
    if (!user) return null;

    logger.info(`QueryUser logout: 用户以 ${user.username} 登出. `);
    return user;
  }
}

const userByToken = {
  type: UserType,
  args: {
    token: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (parentValue, { token }) => {
    const user = await User.checkToken(token);
    const msg = user ? (user.username) : '[无效用户]';
    // console.log('QueryUser userByToken user: ', user);

    logger.info(`QueryUser userByToken: 用户验证 ${msg}`);

    return user;
  }
}


module.exports = {
  // users,
  moreUsers,
  user, userExist,
  usersCount,
  login, logout, userByToken,
  isAdmin,
};
