
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
const Favorite = mongoose.model('favorite');
const User = mongoose.model('user');

const FavoriteType = require('../type/Favorite');


const moreFavorites = {
  type: new GraphQLList(FavoriteType),
  args: {
    operToken: { type: new GraphQLNonNull(GraphQLString) },
    offset: { type: new GraphQLNonNull(GraphQLInt) },
    limit: { type: new GraphQLNonNull(GraphQLInt) },
  },
  async resolve(parentValue, { offset, limit, operToken, }) {
    const user = await User.checkToken(operToken);
    // console.log('moreFavorites operToken: ', operToken);
    if (!user) return null;

    return await Favorite
      .find(
        { owner: user.id },
        {},
        { skip: offset, limit })
      .sort({ "_id": -1 });
  }
};


const favoritesCount = {
  type: GraphQLInt,
  args: {
    operToken: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (parentValue, { operToken, }) => {
    const user = await User.checkToken(operToken);
    if (!user) return 0;

    const count = await Favorite.count({ owner: user.id });
    return count;
  }
};


const favorite = {
  type: GraphQLBoolean,
  args: {
    userToken: { type: new GraphQLNonNull(GraphQLString) },
    // favorid: { type: new GraphQLNonNull(GraphQLID) },
    imageid: { type: new GraphQLNonNull(GraphQLID) },
  },
  async resolve(parentValue, { userToken, imageid, }) {
    const user = await User.checkToken(userToken);
    if (!user) return false;

    const favorite = await Favorite.findOne({ imageid, owner: user.id });
    if (!favorite) return false;
    return favorite.favorited;
  }
};

module.exports = {
  moreFavorites,
  favoritesCount,
  favorite,
};
