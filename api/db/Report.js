const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schemaReport = new Schema({
  // content: String,
  contents: {
    type: [{
      informer: { type: Schema.Types.ObjectId, ref: 'user' },
      content: String,
    }],
    default: [],
  },
  // informer: { type: Schema.Types.ObjectId, ref: 'user' },
  image: { type: Schema.Types.ObjectId, ref: 'image' },
  word: { type: Schema.Types.ObjectId, ref: 'word' },
  // word: {
  //   type: [{
  //     wordid: { type: Schema.Types.ObjectId, ref: 'word' },
  //     informer: { type: Schema.Types.ObjectId, ref: 'user' },
  //     content: String,
  //   }],
  //   default: [],
  // },
  // deleted: { type: Boolean, default: false },
  processed: { type: Boolean, default: false },
}, {
    timestamps: true,
    collection: 'report',
  }
);

mongoose.model('report', schemaReport);
