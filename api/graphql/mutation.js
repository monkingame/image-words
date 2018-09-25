const mongoose = require('mongoose');
const graphql = require('graphql');
const { GraphQLObjectType, GraphQLList, GraphQLID, GraphQLNonNull, GraphQLString, GraphQLBoolean } = graphql;

const { addUser, delUser, updateUserPhone, verifyUserPhone, changePassword, promoteAdmin, } = require('./mutation/MutUser');
const { addImage, voteImage, delImage, } = require('./mutation/MutImage');
const { addWord, delWord, voteWord, } = require('./mutation/MutWord');
const { addReport, delReport, processReport, } = require('./mutation/MutReport');
const { switchBlock, } = require('./mutation/MutBlock');
// const { testMutation, } = require('./mutation/MutTest');
const { switchFavorite, } = require('./mutation/MutFavorite');

const Mutation = new GraphQLObjectType({
  name: 'Mutaion',
  fields: () => ({
    addUser, delUser, updateUserPhone, verifyUserPhone, changePassword, promoteAdmin,
    addImage, delImage,
    addWord, delWord, voteWord,
    addReport, delReport, processReport,
    switchBlock,
    // testMutation,
    switchFavorite,
  })
});

module.exports = Mutation;
