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
const {
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime
} = require('graphql-iso-date');

const mongoose = require('mongoose');
const Image = mongoose.model('image');
const User = mongoose.model('user');
const Word = mongoose.model('word');

//NOTE:注意 这里可能有嵌套调用！ImageType和UserType很可能互相调用
const WordType = require('./Word');


const ImageType = new GraphQLObjectType({
  name: 'ImageType',
  fields: () => ({
    id: { type: GraphQLID },
    filename: { type: GraphQLString },
    author: {
      type: require('./User'),
      async resolve(parentValue) {
        const image = await Image.findById(parentValue.id).populate('author');
        // console.log('ImageType author: ', image.author);
        if (!image) return null;
        return image.author;
      }
    },
    authorid: {
      type: GraphQLID,
      resolve(obj) {
        return obj.author;
      }
    },
    vote: { type: GraphQLInt },
    deleted: { type: GraphQLBoolean },
    // // TODO: words不需要了，这是一个运算量巨大的数据，用 moreWordsByImageId 取代了
    // // TODO: words还是需要，但不能用于普通words查询，而是只能用于新建看图说说后，取得第一条说说记录
    // // TODO:又不需要了 客户端graphql已经删除words字段了
    // words: {
    //   type: new GraphQLList(WordType),
    //   async resolve(parentValue) {
    //     // const image = await Image.findById(parentValue.id).populate('words');
    //     // return image.words;
    //     const words = await Word.find({ image: parentValue.id });
    //     return words;
    //   }
    // },
    createdAt: { type: GraphQLDateTime },
    updatedAt: { type: GraphQLDateTime },
    // signedUrl: 通过客户端提供的oss token，计算signed URL返回给客户端。
    // 主要是针对react-native端，没有合适的直接生成url的API，因此从服务器计算后再发给客户端。
    signedUrl: { type: GraphQLString },
  })
});


module.exports = ImageType;
