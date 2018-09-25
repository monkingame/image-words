
const graphql = require('graphql');
const {
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime
} = require('graphql-iso-date');

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLBoolean,
  // GraphQLTimestamp,
  isOutputType,
} = graphql;


const mongoose = require('mongoose');
const User = mongoose.model('user');
const Image = mongoose.model('image');
const Word = mongoose.model('word');

const ImageType = require('./Image');
const WordType = require('./Word');

const UserType = new GraphQLObjectType({
  name: 'UserType',
  fields: () => ({
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    phoneVerified: { type: GraphQLBoolean },
    token: { type: GraphQLString },
    admin: { type: GraphQLBoolean },
    deleted: { type: GraphQLBoolean },

    // //TODO:危险操作 会产生巨大量的数据操作
    // images: {
    //   type: new GraphQLList(ImageType),
    //   async resolve(parentValue) {
    //     const images = await Image.find({ author: parentValue.id });
    //     return images;
    //   }
    // },
    // //TODO:危险操作 会产生巨大量的数据操作
    // words: {
    //   type: new GraphQLList(WordType),
    //   async resolve(parentValue) {
    //     const words = await Word.find({ author: parentValue.id });
    //     return words;
    //   }
    // },
    createdAt: { type: GraphQLDateTime },
    updatedAt: { type: GraphQLDateTime },
  }),
});


module.exports = UserType;
