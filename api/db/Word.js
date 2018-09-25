const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schemaWords = new Schema({
  content: String,
  author: { type: Schema.Types.ObjectId, ref: 'user' },
  image: { type: Schema.Types.ObjectId, ref: 'image' },
  vote: { type: Number, min: 0, default: 0 },
  deleted: { type: Boolean, default: false },
}, {
    timestamps: true,
    collection: 'word',
  }
);

//TODO:deleted: false 标志还需要判断吗？
schemaWords.statics.vote = async function (id, vote) {
  const word = await this.findByIdAndUpdate(id, {
    $inc: { vote: vote ? 1 : -1 },
  }, { new: true });

  if (word) {
    if (word.vote < 0) {
      word.vote = 0;
      await word.save();
    }
  }

  return word;
}

mongoose.model('word', schemaWords);
