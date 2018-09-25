
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
  GraphQLInputObjectType,
} = graphql;


const OssTokenType = new GraphQLObjectType({
  name: 'OssToken',
  fields: () => ({
    accessKeyId: { type: GraphQLString },
    accessKeySecret: { type: GraphQLString },
    stsToken: { type: GraphQLString },
    region: { type: GraphQLString },
    bucket: { type: GraphQLString },
    secure: { type: GraphQLBoolean },
  })
});


const InputOssTokenType = new GraphQLInputObjectType({
  name: 'InputOssTokenType',
  fields: {
    accessKeyId: { type: GraphQLString },
    accessKeySecret: { type: GraphQLString },
    stsToken: { type: GraphQLString },
    region: { type: GraphQLString },
    bucket: { type: GraphQLString },
    secure: { type: GraphQLBoolean },
  }
});


module.exports = {
  OssTokenType,
  InputOssTokenType,
};

