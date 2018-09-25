
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
  isOutputType,
} = graphql;

const mongoose = require('mongoose');
const Favorite = mongoose.model('favorite');


const FavoriteType = new GraphQLObjectType({
  name: 'FavoriteType',
  fields: () => ({
    id: { type: GraphQLID },
    // favorid: { type: GraphQLID },
    imageid: { type: GraphQLID },
    favorited: { type: GraphQLBoolean },
    word: { type: GraphQLString },

    owner: {
      type: require('./User'),
      async resolve(parentValue) {
        const favorite = await Favorite.findById(parentValue.id).populate('owner');
        if (!favorite) return null;
        return favorite.owner;
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
  }),
});


module.exports = FavoriteType;
