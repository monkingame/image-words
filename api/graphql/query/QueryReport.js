
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
// const User = mongoose.model('user');
// const Image = mongoose.model('image');
// const Word = mongoose.model('word');
const Report = mongoose.model('report');

// const UserType = require('../type/User');
// const ImageType = require('../type/Image');
// const WordType = require('../type/Word');
const ReportType = require('../type/Report');

const { isAdminToken } = require('./Util');


const moreReports = {
  type: new GraphQLList(ReportType),
  args: {
    operToken: { type: new GraphQLNonNull(GraphQLString) },
    offset: { type: new GraphQLNonNull(GraphQLInt) },
    limit: { type: new GraphQLNonNull(GraphQLInt) },
    imageid: { type: GraphQLID },
  },
  // TODO:如果没有提供imageid，说明是要找所有只关于图像的举报；
  // 如果提供了imageid，说明是要找关于说说的举报
  async resolve(parentValue, { offset, limit, operToken, imageid }) {
    const isAdmin = await isAdminToken(operToken);
    if (!isAdmin) return null;

    const queryCondition = imageid ?
      { image: imageid, word: { $ne: null } } :
      { word: null };
    return await Report
      .find(
        queryCondition,
        {},
        { skip: offset, limit: limit })
      // .distinct('image')
      .sort({
        "processed": 1,
        // "_id": 1,
        "updatedAt": 1,//先处理最旧的
      });
  }
};

const reportsCount = {
  type: GraphQLInt,
  args: {
    operToken: { type: new GraphQLNonNull(GraphQLString) },
    imageid: { type: GraphQLID },
  },
  // TODO:如果没有提供imageid，说明是要找所有只关于图像的举报；
  // 如果提供了imageid，说明是要找关于说说的举报
  resolve: async (parentValue, { operToken, imageid }) => {
    const isAdmin = await isAdminToken(operToken);
    if (!isAdmin) return 0;

    const queryCondition = imageid ?
      {
        image: imageid,
        word: { $ne: null },
      } :
      { word: null };
    // const count = await Report.count({});
    const count = await Report.count(queryCondition);
    // const count = await Report.count(queryCondition).distinct('image');
    return count;
  }
};

const report = {
  type: ReportType,
  args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  resolve(parentValue, { id }) {
    return Report.findOne({ _id: id });
  }
};

module.exports = {
  // users,
  moreReports,
  report,
  reportsCount,
};
