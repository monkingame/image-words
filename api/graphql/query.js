// "use strict";

const mongoose = require('mongoose');
const graphql = require('graphql');
const { GraphQLObjectType,
  // GraphQLList, GraphQLID, GraphQLNonNull, GraphQLString,
} = graphql;

// const { moreUsers } = require('./query/QueryUser');
const { moreUsers, user, userExist, login, logout, userByToken,
  isAdmin, usersCount, } = require('./query/QueryUser');
const { image, moreImages, imagesCount, nextImage, } = require('./query/QueryImage');
const { word, searchMoreWords, moreWordsByImageId, wordsCountByImageId, } = require('./query/QueryWord');
const { metadata, } = require('./query/QueryMeta');
const { moreReports, report, reportsCount, } = require('./query/QueryReport');
const { block, } = require('./query/QueryBlock');
const { signedurl, } = require('./query/QueryOss');
const { moreFavorites, favoritesCount, favorite, } = require('./query/QueryFavorite');
const { getSMSVerifyCode, } = require('./query/QueryAliSMS');


const RootQuery = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    // users,
    moreUsers,
    user, userExist, login, logout, userByToken,
    //admin
    isAdmin, usersCount,
    //words
    searchMoreWords,
    moreWordsByImageId, wordsCountByImageId,
    word,
    //image
    moreImages, imagesCount,
    image, nextImage,
    //meta
    metadata,
    //report
    moreReports, report, reportsCount,
    // block
    block,
    // OSS
    signedurl,
    // favorite
    moreFavorites, favoritesCount, favorite,
    // SMS
    getSMSVerifyCode,
  })
});

module.exports = RootQuery;
