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

const inspect = require('object-inspect');
const logger = require("../../util/logger");

// const { Metadata, DEFAULT_META_VERSION,
//   DEFAULT_META_CLIENT_IDENTIFY_WEB, DEFAULT_META_CLIENT_IDENTIFY_REACTNATIVE, } = require('../type/Metadata');
const { Metadata, } = require('../type/Metadata');
const { supportableClientVersion } = require('../../util/files');

const InputMetaIdentify = new GraphQLInputObjectType({
  name: 'InputMetaIdentify',
  fields: {
    clientVersion: { type: new GraphQLNonNull(GraphQLString) },
    clientIdentifyKey: { type: new GraphQLNonNull(GraphQLString) },
  }
});

// const supportableClientVersion = supportableClientVersionList();
// console.log('QueryMeta listClientVersion: ', supportableClientVersion);
// console.log('QueryMeta listClientVersion: ', supportableClientVersion);

const metadata = {
  type: Metadata,
  args: {
    clientId: { type: new GraphQLNonNull(InputMetaIdentify) },
  },
  // resolve: async (parentValue, args) => {
  resolve: async (parentValue, { clientId }) => {
    // // const { clientId } = args;
    // // console.log(clientId);
    // if (!clientId) return null;
    // const { clientVersion, clientIdentifyKey } = clientId;
    // // console.log(clientVersion, clientIdentifyKey);
    // // if ((clientIdentifyKey !== `web-client-image-word`)&&(clientIdentifyKey !== `reactnative-client-image-word`)) return null;
    // if (clientIdentifyKey !== `web-client-image-word`) return null;

    // if (!isLegalClientId(clientId)) return null;
    const valid = isLegalClientId(clientId);
    logger.info(`有客户端登录：${inspect(clientId)} ` + (valid ? `有效` : `无效`));
    if (!valid) return null;

    const metadata = { ...Metadata };
    // console.log('metadata resolve: ', metadata);
    // console.log('request metadata *********************************** : ', );
    return metadata;
  },
};

const isLegalClientId = (clientId) => {
  if (!supportableClientVersion) return false;
  if (!clientId) return false;

  // console.log('QueryMeta isLegalClientId supportableClientVersion: ', supportableClientVersion);
  // console.log('QueryMeta isLegalClientId clientId: ', clientId);
  const { clients, versions } = supportableClientVersion;
  const { clientVersion, clientIdentifyKey } = clientId;

  // if (clientVersion !== DEFAULT_META_VERSION) return false;
  // if ((clientIdentifyKey !== DEFAULT_META_CLIENT_IDENTIFY_WEB) &&
  //   (clientIdentifyKey !== DEFAULT_META_CLIENT_IDENTIFY_REACTNATIVE)) {
  //   return false;
  // }
  if (!clients.includes(clientIdentifyKey)) return false;
  if (!versions.includes(clientVersion)) return false;

  return true;
}

module.exports = {
  metadata,
  isLegalClientId,
  InputMetaIdentify,
};

