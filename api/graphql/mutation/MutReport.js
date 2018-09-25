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

const Word = mongoose.model('word');
const Image = mongoose.model('image');
const User = mongoose.model('user');
const Report = mongoose.model('report');

// const UserType = require('../type/User');
// const ImageType = require('../type/Image');
// const WordType = require('../type/Word');
const ReportType = require('../type/Report');


const addReport = {
  type: ReportType,
  args: {
    userToken: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    imageid: { type: new GraphQLNonNull(GraphQLID) },
    wordid: { type: GraphQLID },//不是必须的
  },
  async resolve(parentValue, { userToken, content, imageid, wordid = null }) {
    if (!content || content.length <= 0) return null;
    const user = await User.checkToken(userToken);
    if (!user) return null;

    // TODO: 此处仅仅是作为探测处理。
    // 如果对于某个图片只有words的举报，而没有图片的举报，那么在image列表中就无法查找到。
    // 此处是用来探测并产生一个新的image举报
    // const reportTester =
    await Report.findOneAndUpdate(
      { image: imageid, word: null, },
      {},
      { new: true, upsert: true },
    );
    // await reportTester.save();

    const report = await Report.findOneAndUpdate(
      // TODO:这里的wordid可能为null，要保留其值，因为在mongodb里面，filed===null也是一个条件
      { image: imageid, word: wordid, },
      {},
      { new: true, upsert: true },
    );
    if (!report) return null;
    report.contents.push({ informer: user.id, content });
    await report.save();

    return report;
  }
};

const delReport = {
  type: ReportType,
  args: {
    operToken: { type: new GraphQLNonNull(GraphQLString) },
    id: { type: new GraphQLNonNull(GraphQLID) },
    deleted: { type: new GraphQLNonNull(GraphQLBoolean) },
  },
  async resolve(parentValue, { operToken, id, deleted, }) {
    const user = await User.checkToken(operToken);
    if (!user || !user.admin) return null;

    const report = await Report.findById(id);
    if (!report) return null;

    //delete image and word
    if (report.word) {
      //说明有word 是要删除某个word
      const word = await Word.findOneAndUpdate(
        { "_id": report.word, },
        { $set: { deleted } },
        { new: true },
      );
      if (word) await word.save();
    } else {
      // 说明没有word 只有image 要删除整个image
      const image = await Image.findOneAndUpdate(
        { "_id": report.image, },
        { $set: { deleted } },
        { new: true },
      );
      if (image) await image.save();
    }

    report.processed = true;
    await report.save();

    return report;
  }
};


const processReport = {
  type: ReportType,
  args: {
    operToken: { type: new GraphQLNonNull(GraphQLString) },
    id: { type: new GraphQLNonNull(GraphQLID) },
    processed: { type: new GraphQLNonNull(GraphQLBoolean) },
  },
  async resolve(parentValue, { operToken, id, processed, }) {
    const user = await User.checkToken(operToken);
    if (!user || !user.admin) return null;

    const report = await Report.findByIdAndUpdate(
      id,
      { $set: { processed } },
      { new: true, },
    );

    return report;
  }
};

module.exports = {
  addReport,
  delReport,
  processReport,
};

