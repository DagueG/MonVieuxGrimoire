const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');

dotenv.config();
const app = express();

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Configurer CORS pour autoriser les requêtes depuis le front-end
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

app.use('/uploads', express.static('uploads'));

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err.message);
});

// Utiliser les routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

// Lancer le serveur
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
