const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);

  const book = new Book({
    ...bookObject,
    userId: req.userData.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
  });

  book.save()
    .then(() => res.status(201).json({ message: 'Book added successfully!' }))
    .catch(error => res.status(400).json({ error }));
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

exports.getBookById = (req, res, next) => {
  const bookId = req.params.id;
  Book.findById(bookId)
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé !' });
      }
      res.status(200).json(book);
    })
    .catch(error => res.status(500).json({ error }));
};

exports.updateBook = (req, res, next) => {
  const bookId = req.params.id;
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
  } : { ...req.body };

  Book.updateOne({ _id: bookId }, { ...bookObject, _id: bookId })
    .then(() => res.status(200).json({ message: 'Livre mis à jour avec succès !' }))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteBook = (req, res, next) => {
  const bookId = req.params.id;
  Book.findById(bookId)
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé !' });
      }
      const filename = book.imageUrl.split('/uploads/')[1];
      fs.unlink(`uploads/${filename}`, () => {
        Book.deleteOne({ _id: bookId })
          .then(() => res.status(200).json({ message: 'Livre supprimé avec succès !' }))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.rateBook = (req, res, next) => {
  const bookId = req.params.id;
  const rating = req.body.rating;

  Book.findById(bookId)
    .then(book => {
      if (!book) {
        return res.status(404).json({ message: 'Livre non trouvé !' });
      }

      const existingRating = book.ratings.find(rating => rating.userId === req.userData.userId);

      if (existingRating) {
        existingRating.grade = rating;
      } else {
        book.ratings.push({ userId: req.userData.userId, grade: rating });
      }

      const totalRatings = book.ratings.length;
      const sumRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
      book.averageRating = sumRatings / totalRatings;

      return book.save();
    })
    .then(updatedBook => {
      res.status(200).json(updatedBook);
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getBestRatedBooks = (req, res, next) => {
  Book.find({ averageRating: { $exists: true } }).sort({ averageRating: -1 }).limit(5)
    .then(books => {
      if (!books || books.length === 0) {
        return res.status(404).json({ message: 'Aucun livre trouvé !' });
      }
      res.status(200).json(books);
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};

