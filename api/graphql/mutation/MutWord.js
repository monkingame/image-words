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

const { checkCensorship } = require('./Util');

////////////////////
//mutation

const addWord = {
  type: WordType,
  args: {
    userToken: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    imageid: { type: new GraphQLNonNull(GraphQLID) },
  },
  async resolve(parentValue, { userToken, content, imageid }) {
    const user = await User.checkToken(userToken);
    if (!user) return null;
    if (!content || !imageid) return null;

    // const image = await Image.findById(imageid);
    // if (!image) return null;

    const passed = checkCensorship(content.trim());
    if (!passed) return null;

    const word = new Word({
      content: content.trim(),
      image: imageid,
      author: user.id,
    });
    // image.words.push(word.id);

    await word.save();
    // await image.save();

    return word;
  }
};

const delWord = {
  type: WordType,
  args: {
    userToken: { type: new GraphQLNonNull(GraphQLString) },
    id: { type: new GraphQLNonNull(GraphQLID) },
    deleted: { type: GraphQLBoolean },
  },
  async resolve(parentValue, { userToken, id, deleted = true }) {
    const user = await User.checkToken(userToken);
    // console.log(user);
    if (!user) return null;

    // const delCondition = { _id: id };
    // if (!user.admin) {
    //   delCondition.author = user.id;
    // }
    // const word = await Word.findOne(delCondition);
    // if (!word) return null;

    // // //注意这里可能产生数据不一致问题，word有数据，而image里面没有索引
    // // 不再存在 image里面的words结构被删除了 2018-05-14
    // // const image = await Image.findById(word.image);
    // // if (!image) return null;
    // // const index = image.words.indexOf(id);
    // // if (index > -1) image.words.splice(index, 1);
    // // await image.save();

    // word.deleted = true;
    // await word.save();

    const additionContion = user.admin ?
      {} :
      { "author": user.id };
    const word = await Word.findOneAndUpdate(
      { "_id": id, ...additionContion },
      // { $set: { "deleted": true } },
      { $set: { deleted } },
      { new: true },
    );

    if (!word) return null;
    // console.log('delImage image: ', image);
    // TODO: findOneAndUpdate 应该是已经更新数据库了，save()可能没必要
    await word.save();

    return word;
  }
};

const voteWord = {
  type: WordType,
  args: {
    // userToken: { type: new GraphQLNonNull(GraphQLString) },
    userToken: { type: GraphQLString },
    id: { type: new GraphQLNonNull(GraphQLID) },
    vote: { type: new GraphQLNonNull(GraphQLBoolean) },//boolean值，表示赞成票或反对票
  },
  async resolve(parentValue, { userToken, id, vote }) {
    // 点赞 可以不需要用户登录
    // const user = await User.checkToken(userToken);
    // // console.log(user);
    // if (!user) return null;

    const word = await Word.vote(id, vote);
    if (!word) return null;

    await Image.vote(word.image, vote);

    return word;
  }
};


module.exports = {
  // WordType,
  // words, word,
  addWord, delWord, voteWord,
};
