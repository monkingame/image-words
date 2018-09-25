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

const mongoose = require('mongoose');
const User = mongoose.model('user');
const Image = mongoose.model('image');
const Word = mongoose.model('word');

//NOTE:注意 这里可能有嵌套调用！ImageType和UserType很可能互相调用
const UserType = require('../type/User');
const ImageType = require('../type/Image');
const WordType = require('../type/Word');

const { base64ToBuffer } = require('../../util/base64');
const { saveFile2OSS } = require('../../util/oss');

const { checkCensorship } = require('./Util');

///////////////////////////////////
//mutation

const InputNewImageData = new GraphQLInputObjectType({
  name: 'InputNewImageData',
  fields: {
    userToken: { type: new GraphQLNonNull(GraphQLString) },
    filename: { type: new GraphQLNonNull(GraphQLString) },
    base64: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
  }
});

const addImage = {
  type: ImageType,
  args: { newImageData: { type: new GraphQLNonNull(InputNewImageData) } },
  async resolve(parentValue, { newImageData }) {
    if (!newImageData) return null;
    const { userToken, filename, base64, content } = newImageData;
    const user = await User.checkToken(userToken);
    if (!user || !filename || !base64 || !content) return null;

    const passed = checkCensorship(content.trim());
    // console.log('addImage 审查结果: ', passed);
    if (!passed) return null;

    const { name, url } = await saveFile2OSS(filename, base64ToBuffer(base64));
    // console.log('addImage save 2 OSS : ', name, url);

    const image = new Image({ filename, author: user.id });
    const word = new Word({
      content: content.trim(),
      author: user.id,
      image: image.id,
    });
    //TODO:不再需要words @2018-05-14 11:54:30
    // image.words = [word.id];

    await word.save();
    await image.save();

    return image;
  },
};

//delete image
const delImage = {
  type: ImageType,
  args: {
    userToken: { type: new GraphQLNonNull(GraphQLString) },
    id: { type: new GraphQLNonNull(GraphQLID) },
    deleted: { type: GraphQLBoolean },
  },
  async resolve(parentValue, { userToken, id, deleted = true }) {
    // console.log('MutImage delImage : ', id);

    const user = await User.checkToken(userToken);
    if (!user) return null;

    // const delCondition = { _id: id };
    // if (!user.admin) {
    //   //设置查找参数 如果是管理员 则直接更新
    //   delCondition.author = user.id;
    // }

    // console.log('delCondition: ', delCondition);
    // const image = await Image.findOne(delCondition);
    // console.log(image);
    // if (!image) return null;

    // //NOTE:Image.findOne.populate执行结果 还是Image对象
    // //只是把id对应的words都填充到了words字段上
    // const image = await Image.findOne(delCondition).populate('words');
    // // console.log('imagePopu : ', imagePopu);
    // if (!image) return null;

    // const image = await Image.findOne(delCondition);
    // if (!image) return null;

    // // const { words } = image;
    // // const { words } = await image.populate('words');
    // // console.log('words: ', words);
    // // // const { words } = image.populate('words');
    // // //TODO:没有必要对words列表进行删除，因为words依附于image，
    // // //image不存在了，words也就没有了。
    // // //但如果用户对某些words有收藏，或者举报的，可能就有用了。
    // // //暂时先这样，后期根据情况，决定是否删除words
    // // // 不再存在 image里面的words结构被删除了 2018-05-14
    // // if (words) {
    // //   await Promise.all(words.map(async (w) => {
    // //     w.deleted = true;
    // //     // console.log(w);
    // //     await w.save();
    // //   }));
    // // }

    // // image.deleted = true;
    // // await image.save();
    // image.deleted = true;
    // await image.save();

    // return image;

    // const delCondition = user.admin ?
    //   { _id: id } :
    //   { _id: id, author: user.id };
    const additionContion = user.admin ?
      {} :
      { "author": user.id };

    // //TODO:不再主动删除image里面的words，而是保持原状态
    // const wordsDeleted = await Word.update(
    //   { "image": id, ...additionContion },
    //   // { $set: { "deleted": true } },
    //   { $set: { deleted } },
    //   { new: true, multi: true, },
    // );
    // // console.log('delImage wordsDeleted: ', wordsDeleted);

    // const image = await Image.findByIdAndUpdate(
    //   id,
    //   { $set: { "deleted": true } },
    //   { new: true },
    // );
    const image = await Image.findOneAndUpdate(
      { "_id": id, ...additionContion },
      // { $set: { "deleted": true } },
      { $set: { deleted } },
      { new: true },
    );
    if (!image) return null;
    // console.log('delImage image: ', image);
    await image.save();

    return image;
  }
};


module.exports = {
  // ImageType,
  // images, image,
  addImage, delImage,
};

