
// 收藏 @2018-08-08 16:40:55

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schemaFavorite = new Schema({
  // 收藏ID，可能是imageid，也可能是wordid
  // TODO: 但目前，只对imageid收藏
  // 没有命名为favoriteid的原因是，它与favorited太相似了，容易拼写错误
  // favorid: { type: Schema.Types.ObjectId },
  // @2018-08-10 13:12:26 改为imageid，而word再存储（即selected label）
  imageid: { type: Schema.Types.ObjectId },
  favorited: { type: Boolean, default: false },
  owner: { type: Schema.Types.ObjectId, ref: 'user' },
  word: String,
}, {
    timestamps: true,
    collection: 'favorite',
  }
);

mongoose.model('favorite', schemaFavorite);
