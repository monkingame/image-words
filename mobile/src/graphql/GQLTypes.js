
// const graphql = require('graphql');
// const {
//   // GraphQLSchema,
//   // GraphQLObjectType,
//   GraphQLString,
//   // GraphQLInt,
//   // GraphQLID,
//   // GraphQLList,
//   GraphQLNonNull,
//   // GraphQLBoolean,
//   // isOutputType,
//   GraphQLInputObjectType,
// } = graphql;

// export const InputMetaIdentify = new GraphQLInputObjectType({
//   name: 'InputMetaIdentify',
//   fields: {
//     clientVersion: { type: new GraphQLNonNull(GraphQLString) },
//     clientIdentifyKey: { type: new GraphQLNonNull(GraphQLString) },
//   }
// });


export const getInputOssTokenByMetadata = (metadata) => {
  if (!metadata) return null;
  const { ossToken } = metadata;
  if (!ossToken) return null;

  // 此处的ossToken包含__typename等属性，不能作为纯粹的InputOssTokenType传递，会出错
  const { accessKeyId, accessKeySecret, stsToken, region, bucket, secure } = ossToken;
  const pureOssToken = { accessKeyId, accessKeySecret, stsToken, region, bucket, secure };
  return pureOssToken;
}

