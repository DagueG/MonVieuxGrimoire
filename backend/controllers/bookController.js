const Book = require('../models/Book');
const fs = require('fs');

exports.createBook = (req, res, next) => {
  // Conversion de l'objet JSON envoyé avec les informations du livre
  const bookObject = JSON.parse(req.body.book);

  // Création d'une nouvelle instance du livre avec les données fournies
  const book = new Book({
    ...bookObject,
    userId: req.userData.userId,  // Enregistre l'ID de l'utilisateur
    imageUrl: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`  // Enregistre l'URL de l'image avec 'uploads'
  });

  // Sauvegarde du livre dans la base de données
  book.save()
    .then(() => res.status(201).json({ message: 'Book added successfully!' }))
    .catch(error => res.status(400).json({ error }));
};

// Récupérer tous les livres dans la base de données
exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }));
};

exports.getBookById = (req, res, next) => {
  const bookId = req.params.id;  // Récupère l'ID du livre depuis l'URL
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
      // Supprimer le fichier image lié au livre
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

      // Ajouter la nouvelle note
      book.ratings.push({ userId: req.userData.userId, grade: rating });

      // Calculer la nouvelle moyenne des notes
      const totalRatings = book.ratings.length;
      const sumRatings = book.ratings.reduce((sum, rating) => sum + rating.grade, 0);
      book.averageRating = sumRatings / totalRatings;

      // Sauvegarder les modifications
      return book.save();
    })
    .then(updatedBook => {
      // Renvoie le livre mis à jour
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

