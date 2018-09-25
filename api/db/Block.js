// 禁止 ban

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schemaBlock = new Schema({
  // 屏蔽ID，可能是imageid，也可能是wordid
  banid: { type: Schema.Types.ObjectId },
  banned: { type: Boolean, default: false },
  owner: { type: Schema.Types.ObjectId, ref: 'user' },
}, {
    timestamps: true,
    collection: 'block',
  }
);

mongoose.model('block', schemaBlock);

