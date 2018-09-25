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

const UserType = require('../type/User');
const ImageType = require('../type/Image');
const WordType = require('../type/Word');
const { isAdminToken } = require('./Util');

/////////////////////
//query

// //TODO:deprecated
// const words = {
//   type: new GraphQLList(WordType),
//   resolve() {
//     return Word
//       .find({ deleted: false })
//       .sort({ "_id": -1 });
//   }
// };

// const wordsByImageId = {
//   type: new GraphQLList(WordType),
//   args: { imageid: { type: new GraphQLNonNull(GraphQLID) } },
//   resolve(parentValue, { imageid }) {
//     // return Word.findOne({ _id: id, deleted: false });
//     return Word
//       .find({ image: imageid, deleted: false })
//       .sort({ "vote": -1, "_id": -1 });
//   }
// }

const wordsCountByImageId = {
  type: GraphQLInt,
  args: {
    userToken: { type: new GraphQLNonNull(GraphQLString) },
    imageid: { type: new GraphQLNonNull(GraphQLID) },
  },
  resolve: async (parentValue, { userToken, imageid }) => {
    const isAdmin = await isAdminToken(userToken);
    // console.log('imagesCount isAdmin: ', isAdmin);
    if (!isAdmin) return 0;
    const count = await Word.count({ image: imageid });
    return count;
  }
};

const moreWordsByImageId = {
  type: new GraphQLList(WordType),
  args: {
    imageid: { type: new GraphQLNonNull(GraphQLID) },
    offset: { type: new GraphQLNonNull(GraphQLInt) },
    limit: { type: new GraphQLNonNull(GraphQLInt) },
    userToken: { type: GraphQLString },//此处token不是必须的，只有admin才会取回所有包括删除的数据
  },
  async resolve(parentValue, { imageid, offset, limit, userToken }) {
    const isAdmin = await isAdminToken(userToken);
    const delFilter = isAdmin ?
      {} :
      { deleted: false };

    return await Word
      // .find({ image: imageid, deleted: false }, {}, { skip: offset, limit: limit })
      .find({ image: imageid, ...delFilter },
        {},
        { skip: offset, limit: limit })
      .sort({ "vote": -1, "_id": -1 });
  }
}


const word = {
  type: WordType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    userToken: { type: GraphQLString },//此处token不是必须的，只有admin才会取回所有包括删除的数据
  },
  async resolve(parentValue, { id, userToken }) {
    const isAdmin = await isAdminToken(userToken);

    // return Word.findById(id);
    // return Word.findOne({ _id: id, deleted: false });

    return Word.findOne(isAdmin ?
      { _id: id, } :
      { _id: id, deleted: false });
  }
};


// //TODO:deprecated
// const searchWords = {
//   type: new GraphQLList(WordType),
//   args: { keyword: { type: new GraphQLNonNull(GraphQLString) } },
//   async resolve(parentValue, { keyword }) {
//     if (!keyword || keyword.length <= 0) {
//       // console.log('no input...');
//       return [];
//     };
//     const search = genSearchCondition(keyword);
//     // console.log('QueryWords searchWords: ', search);
//     return Word
//       .find({ 'content': search, deleted: false })
//       .sort({ '_id': -1 });
//   }
// }


const searchMoreWords = {
  type: new GraphQLList(WordType),
  args: {
    keyword: { type: new GraphQLNonNull(GraphQLString) },
    offset: { type: new GraphQLNonNull(GraphQLInt) },
    limit: { type: new GraphQLNonNull(GraphQLInt) },
  },
  async resolve(parentValue, { keyword, offset, limit }) {
    if (!keyword || keyword.length <= 0) {
      // console.log('no input...');
      return [];
    };
    const search = genSearchCondition(keyword);
    // console.log('QueryWords searchWords: ', search);
    return Word
      .find({ 'content': search, deleted: false }, {}, { skip: offset, limit: limit })
      .sort({ '_id': -1 });
  }
}


const genSearchCondition = (words) => {
  const searchWords = words.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  return (new RegExp(`${searchWords}`, 'g'));
}


// const getImageByWordId = {
//   type: require('./Image').ImageType,
//   args: { id: { type: new GraphQLNonNull(GraphQLID) } },
//   resolve(parentValue, { id }) {
//     return null;
//   }
// }

module.exports = {
  // words, 
  word,
  // wordsByImageId,
  moreWordsByImageId,
  wordsCountByImageId,
  // searchWords,
  searchMoreWords,
};
