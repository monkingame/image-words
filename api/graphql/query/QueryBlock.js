// query block

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
// const Image = mongoose.model('image');
const User = mongoose.model('user');
const Block = mongoose.model('block');

// const UserType = require('../type/User');
// const ImageType = require('../type/Image');
// const WordType = require('../type/Word');
const BlockType = require('../type/Block');


const block = {
  type: GraphQLBoolean,
  args: {
    // userToken: { type: new GraphQLNonNull(GraphQLString) },
    // TODO: 按理说 应该必须提供userToken，否则无法屏蔽
    userToken: { type: GraphQLString },
    banid: { type: new GraphQLNonNull(GraphQLID) },
  },
  async resolve(parentValue, { userToken, banid, }) {
    // console.log('BlockType query block: ', userToken);
    const user = await User.checkToken(userToken);
    if (!user) return false;

    const block = await Block.findOne({ banid, owner: user.id });
    if (!block) return false;
    return block.banned;
  }
};


module.exports = {
  block,
};
