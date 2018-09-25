const graphql = require('graphql');
const { GraphQLSchema } = graphql;

const query = require('./query');
const mutation = require('./mutation');

module.exports = new GraphQLSchema({
  query,
  mutation,
});
