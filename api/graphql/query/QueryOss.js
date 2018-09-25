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

// const { OssTokenType } = require('../type/AliOss');
const { stsSignatureUrl } = require('../../util/oss');
const { InputOssTokenType } = require('../type/AliOss');


const signedurl = {
  type: GraphQLString,
  args: {
    ossToken: { type: new GraphQLNonNull(InputOssTokenType) },
    filename: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve(parentValue, { ossToken, filename, }) {
    if (!ossToken || !filename) return null;
    return stsSignatureUrl(ossToken, filename);
  },
};


module.exports = {
  signedurl,
};

