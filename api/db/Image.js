const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const schemaImages = new Schema({
  filename: String,
  author: { type: Schema.Types.ObjectId, ref: 'user' },
  // words: [{ type: Schema.Types.ObjectId, ref: 'word' }],
  vote: { type: Number, min: 0, default: 0 },
  deleted: { type: Boolean, default: false },
}, {
    timestamps: true,
    collection: 'image',
  }
);


//TODO:deleted: false 标志还需要判断吗？
schemaImages.statics.vote = async function (id, vote) {
  const image = await this.findByIdAndUpdate(id, {
    $inc: { vote: vote ? 1 : -1 },
  }, { new: true });

  if (image) {
    if (image.vote < 0) {
      image.vote = 0;
      await image.save();
    }
  }

  return image;
}

mongoose.model('image', schemaImages);
