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
const Favorite = mongoose.model('favorite');


const switchFavorite = {
  type: GraphQLBoolean,
  args: {
    userToken: { type: new GraphQLNonNull(GraphQLString) },
    // favorid: { type: new GraphQLNonNull(GraphQLID) },
    imageid: { type: new GraphQLNonNull(GraphQLID) },
    favorited: { type: new GraphQLNonNull(GraphQLBoolean) },
    word: { type: GraphQLString },
  },
  async resolve(parentValue, { userToken, imageid, favorited, word }) {
    const user = await User.checkToken(userToken);
    if (!user) return false;

    if (favorited) {
      const favorite = await Favorite.findOneAndUpdate(
        { imageid, owner: user.id, },
        {},
        { new: true, upsert: true, },
      );
      if (!favorite) return false;
      favorite.favorited = favorited;
      favorite.word = word;
      await favorite.save();

      return favorite.favorited;
    } else {
      const favorite = await Favorite.findOneAndRemove(
        { imageid, owner: user.id, },
      );
      return favorited;
    }
  }
};


module.exports = {
  switchFavorite,
};

