const mongoose = require('mongoose');
const Book = require('./models/Book'); // Assure-toi que le chemin vers le modèle est correct

// URI MongoDB directement dans le script
const mongoURI = 'mongodb+srv://testnom:testpassword@mon-vieux-grimoire.pf68g.mongodb.net/?retryWrites=true&w=majority&appName=mon-vieux-grimoire';

// Connexion à MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connexion à MongoDB réussie !');
  
  // Récupérer tous les livres
  Book.find()
    .then(books => {
      console.log('Liste des livres:', books);
      mongoose.connection.close(); // Fermer la connexion après l'opération
    })
    .catch(error => {
      console.error('Erreur lors de la récupération des livres:', error);
      mongoose.connection.close();
    });
})
.catch(error => {
  console.error('Erreur de connexion à MongoDB:', error);
});
