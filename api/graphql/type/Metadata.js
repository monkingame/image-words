const fs = require('fs');
const path = require('path');

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
const {
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime
} = require('graphql-iso-date');

const { genToken, POLICY_READ } = require('../../util/oss');
const { genTokenDanger } = require('../../util/oss');
const { OssTokenType } = require('./AliOss');
const { eulaInfo } = require('../../util/files');

const DEFAULT_META_VERSION = `1.1.0`;
// const DEFAULT_META_VERSION = `1.000.100`;
// const DEFAULT_META_CLIENT_IDENTIFY_WEB = `web-client-image-word`;
// const DEFAULT_META_CLIENT_IDENTIFY_REACTNATIVE = `react-native-client-image-word`;

// const eulaInfo = fs.readFileSync(path.join(__dirname, '/../../public', 'eula.txt'), 'UTF-8');
// console.log(eulaTxt);

const Metadata = new GraphQLObjectType({
  name: 'Metadata',
  fields: () => ({
    clientKey: {
      type: GraphQLString,
      resolve: () => `${process.env.SECRET_CLIENT_SIDE_KEY}`,
    },
    version: {
      type: GraphQLString,
      // resolve: () => `1.0.1@${(new Date()).toLocaleString()}`,
      resolve: () => DEFAULT_META_VERSION,
    },
    eula: {
      type: GraphQLString,
      resolve: () => eulaInfo,
    },
    ossToken: {
      // type: require('./OssToken'),
      type: OssTokenType,
      resolve: async () => {
        //TODO:NOTE:调试需要，暂时关闭正常genToken，调用genTokenDanger。
        //TODO:在宿舍机器上，经常出现Error: connect ETIMEDOUT 106.11.61.112:443
        const token = await genToken(POLICY_READ);
        // const token = await genTokenDanger();
        return token;
      },
    },
    timestamp: {
      type: GraphQLDateTime,
      resolve: () => {
        const dt = new Date();
        // console.log('Metadata timestamp got+++++++++++++:', dt);
        return dt;
      },
    },
  })
});


module.exports = {
  // DEFAULT_META_VERSION,
  // DEFAULT_META_CLIENT_IDENTIFY_WEB, DEFAULT_META_CLIENT_IDENTIFY_REACTNATIVE,
  Metadata,
};
