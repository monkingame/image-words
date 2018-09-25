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

const User = mongoose.model('user');
const Image = mongoose.model('image');
const Word = mongoose.model('word');


const WordType = new GraphQLObjectType({
  name: 'WordType',
  fields: () => ({
    id: { type: GraphQLID },
    content: { type: GraphQLString },
    vote: { type: GraphQLInt },
    deleted: { type: GraphQLBoolean },
    author: {
      type: require('./User'),
      async resolve(parentValue) {
        const word = await Word.findById(parentValue.id).populate('author');
        if (!word) return null;
        return word.author;
      }
    },
    authorid: {
      type: GraphQLID,
      resolve(obj) {
        return obj.author;
      }
    },
    image: {
      //TODO:deprecated
      type: require('./Image'),
      // async resolve(obj, args, context, info) {
      async resolve(parentValue) {
        // console.log('WordType image resolve: ',parentValue);
        // const word = parentValue.populate('image');
        // return word.image;
        // const word = new Word(parentValue);
        // return word.populate('image').image;

        const word = await Word.findById(parentValue.id).populate('image');
        if (!word) return null;
        return word.image;
      }
    },
    imageid: {
      type: GraphQLID,
      resolve(obj) {
        return obj.image;
      }
    },
    createdAt: { type: GraphQLDateTime },
    updatedAt: { type: GraphQLDateTime },
  })
});


module.exports = WordType;
