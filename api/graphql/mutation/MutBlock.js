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

// const Word = mongoose.model('word');
// const Image = mongoose.model('image');
const User = mongoose.model('user');
const Block = mongoose.model('block');

// const UserType = require('../type/User');
// const ImageType = require('../type/Image');
// const WordType = require('../type/Word');
const BlockType = require('../type/Block');


const switchBlock = {
  type: GraphQLBoolean,
  args: {
    userToken: { type: new GraphQLNonNull(GraphQLString) },
    banid: { type: new GraphQLNonNull(GraphQLID) },
    banned: { type: new GraphQLNonNull(GraphQLBoolean) },
  },
  async resolve(parentValue, { userToken, banid, banned, }) {
    const user = await User.checkToken(userToken);
    if (!user) return false;

    // console.log('');
    if (banned) {
      const block = await Block.findOneAndUpdate(
        { banid, owner: user.id, },
        {},
        { new: true, upsert: true, },
      );
      if (!block) return false;
      block.banned = banned;
      await block.save();
      // console.log('MutBlock switchBlock1: ', block);

      return block.banned;
    } else {
      const block = await Block.findOneAndRemove(
        { banid, owner: user.id, },
      );
      // console.log('MutBlock switchBlock2: ', block);
      return banned;
    }
  }
};


module.exports = {
  switchBlock,
};

