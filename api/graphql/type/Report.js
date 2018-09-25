
const graphql = require('graphql');
const {
  GraphQLDate,
  GraphQLTime,
  GraphQLDateTime
} = require('graphql-iso-date');

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

// const ImageType = require('./Image');
// const WordType = require('./Word');

const ContentType = new GraphQLObjectType({
  name: 'ContentType',
  fields: () => ({
    id: { type: GraphQLID },
    informer: { type: GraphQLID },
    content: { type: GraphQLString },
  }),
});


const ReportType = new GraphQLObjectType({
  name: 'ReportType',
  fields: () => ({
    id: { type: GraphQLID },
    // content: { type: GraphQLString },
    //TODO:应该返回前几个就行，否则数据量太大
    // contents: { type: new GraphQLList(GraphQLString), },
    contents: {
      // type: new GraphQLList(ContentType),
      type: GraphQLString,
      async resolve(parentValue) {
        // const report = await Report.findById(parentValue.id).populate('image');
        // return report.image;
        // TODO: 举报 ，只取回前3个举报内容，是否应该改成10个？或者返回全部列表？
        return parentValue.contents.slice(0, 3).map((ele) => ele.content).join(',');
      }
    },
    processed: { type: GraphQLBoolean },
    imageid: {
      type: GraphQLID,
      resolve(obj) {
        return obj.image;
      }
    },
    wordid: {
      type: GraphQLID,
      resolve(obj) {
        return obj.word;
      }
    },
    image: {
      type: require('./Image'),
      async resolve(parentValue) {
        const report = await Report.findById(parentValue.id).populate('image');
        if (!report) return null;
        return report.image;
      }
    },
    word: {
      type: require('./Word'),
      async resolve(parentValue) {
        const report = await Report.findById(parentValue.id).populate('word');
        if (!report) return null;
        return report.word;
      }
    },

    createdAt: { type: GraphQLDateTime },
    updatedAt: { type: GraphQLDateTime },
  }),
});


module.exports = ReportType;
