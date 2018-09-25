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
const { GraphQLDateTime, } = require('graphql-iso-date');

const mongoose = require('mongoose');
const Image = mongoose.model('image');
const User = mongoose.model('user');

//NOTE:注意 这里可能有嵌套调用！ImageType和UserType很可能互相调用
const UserType = require('../type/User');
const ImageType = require('../type/Image');
const WordType = require('../type/Word');
const { InputOssTokenType } = require('../type/AliOss');

const { isAdminToken } = require('./Util');
const { stsSignatureUrl } = require('../../util/oss');

/////////////////////
//query

// //TODO:deprecated
// const images = {
//   type: new GraphQLList(ImageType),
//   resolve() {
//     // console.log(typeof WordType, WordType);
//     return Image
//       .find({ deleted: false })
//       .sort({ "_id": -1 });
//   }
// };

// @2018-06-30 10:44:43
// 管理员专用
const imagesCount = {
  type: GraphQLInt,
  args: {
    userToken: { type: new GraphQLNonNull(GraphQLString) },
  },
  resolve: async (parentValue, { userToken }) => {
    const isAdmin = await isAdminToken(userToken);
    // console.log('imagesCount isAdmin: ', isAdmin);

    if (!isAdmin) return 0;
    const count = await Image.count({});
    return count;
  }
};

// 查询更多image，分页模式：偏移量+页数
// TODO: 这里似乎有问题 ossToken没有设置的话 react-native端可能无法获取signedUrl
// TODO: 需要验证
const moreImages = {
  type: new GraphQLList(ImageType),
  args: {
    offset: { type: new GraphQLNonNull(GraphQLInt) },
    limit: { type: new GraphQLNonNull(GraphQLInt) },
    userToken: { type: GraphQLString },//此处token不是必须的，只有admin才会取回所有包括删除的数据
  },
  // async resolve(parentValue, { offset, limit, userToken }) {
  async resolve(parentValue, { offset, limit, userToken }) {
    // console.log('moreImages userToken: ', userToken);
    // let isAdmin = false;
    // if (userToken) {
    //   const user = await User.checkToken(userToken);
    //   if (!user || !user.admin) return null;
    // }
    const isAdmin = await isAdminToken(userToken);
    // console.log('moreImages isAdmin: ', isAdmin);

    return await Image
      .find(isAdmin ? {} : { deleted: false },
        {},
        { skip: offset, limit: limit })
      .sort({ "_id": -1 });
  }
}


const image = {
  type: ImageType,
  args: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    userToken: { type: GraphQLString },//此处token不是必须的，只有admin才会取回所有包括删除的数据
    // 此处ossToken也不是必须的，react-native客户端会传入ossToken，让服务器返回singedUrl
    // 因为react-native客户端自己不能计算（ali-oss SDK没有rn版本）
    ossToken: { type: InputOssTokenType },
  },
  async resolve(parentValue, { id, userToken, ossToken }) {
    // console.log('收到QueryImage请求 : ', { id, userToken, ossToken });

    const isAdmin = await isAdminToken(userToken);

    const image = await Image.findOne(
      isAdmin ?
        { _id: id, } :
        { _id: id, deleted: false }
    );
    // console.log(id);

    if (!image) return null;

    if (ossToken) {
      image.signedUrl = stsSignatureUrl(ossToken, image.filename);
    }

    return image;
  }
};


// 获取下一个图像：游标模式，只获取一张
const nextImage = {
  type: ImageType,
  args: {
    cursor: { type: new GraphQLNonNull(GraphQLDateTime) },
    // direction取值： before after
    direction: { type: new GraphQLNonNull(GraphQLString) },
    //此处token不是必须的，只有admin才会取回所有包括删除的数据
    operToken: { type: GraphQLString },
    // 此处ossToken是react-native客户端才会传入的参数，让服务器返回singedUrl
    // 因为react-native客户端自己不能计算（ali-oss SDK没有rn版本）
    ossToken: { type: InputOssTokenType },
  },
  async resolve(parentValue, { cursor, direction, operToken, ossToken }) {
    const isAdmin = await isAdminToken(operToken);
    const adminCondition = isAdmin ? {} : { deleted: false };
    const compare = (direction === 'before') ? '$lt' : '$gt';
    const sort = (direction === 'before') ? { '_id': -1 } : { '_id': 1 };

    const image = await Image.findOne({
      'createdAt': { [compare]: cursor },
      ...adminCondition,
    }, {},
      { sort });

    if (!image) return null;
    if (ossToken) {
      image.signedUrl = stsSignatureUrl(ossToken, image.filename);
    }
    return image;
  },
};


module.exports = {
  // ImageType,
  // images,
  imagesCount,
  moreImages,
  image,
  // addImage, delImage,
  nextImage,
};
