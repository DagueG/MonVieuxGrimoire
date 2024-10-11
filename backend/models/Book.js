const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true }, //generation base 64
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  ratings: [                                //verification que l'utilisateur est unique
    {
      userId: { type: String, required: true },
      grade: { type: Number, required: true }
    }
  ],
  averageRating: { type: Number, default: 0 }
});

module.exports = mongoose.model('Book', bookSchema);
