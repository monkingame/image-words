// TODO: NOTE: 作为各种测试及调试的mutation

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

const md5 = require('md5');

const mongoose = require('mongoose');
const User = mongoose.model('user');
const Image = mongoose.model('image');
const ImageType = require('../type/Image');

// const { EncryptAESServer, DecryptAESServer } = require('../../util/crypto');

///////////////////////////////////
//mutation


const testMutation = {
  // type: GraphQLInt,
  type: ImageType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
  },
  async resolve(parentValue, params) {
    // TODO: 此处是为了验证Image.findById(id).populate('author')是否有null错误
    // 比如 id不存在 那么findById(id)可能会返回null 后面的populate是否就出错误？
    // 实验证明 没有问题。 graphql返回的是null 没有出现调用错误
    const { id } = params;
    const image = await Image.findById(id).populate('author');
    // console.log('testMutation image: ', image);
    // const image = await Image.findById(id);
    // console.log('testMutation image: ', image);

    return image;
  }
};

module.exports = {
  testMutation,
};
