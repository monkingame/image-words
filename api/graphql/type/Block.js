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
// const Image = mongoose.model('image');
// const User = mongoose.model('user');
// const Word = mongoose.model('word');
const Block = mongoose.model('block');


const BlockType = new GraphQLObjectType({
  name: 'BlockType',
  fields: () => ({
    id: { type: GraphQLID },
    banid: { type: GraphQLID },
    banned: { type: GraphQLBoolean },

    owner: {
      type: require('./User'),
      async resolve(parentValue) {
        const block = await Block.findById(parentValue.id).populate('owner');
        if (!block) return null;
        return block.owner;
      }
    },
    ownerid: {
      type: GraphQLID,
      resolve(obj) {
        return obj.owner;
      }
    },

    createdAt: { type: GraphQLDateTime },
    updatedAt: { type: GraphQLDateTime },
  })
});


module.exports = BlockType;
