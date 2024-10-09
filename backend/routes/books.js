const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.post('/', auth, multer, bookController.createBook);
router.get('/', bookController.getAllBooks);

// Additional routes for other book operations

module.exports = router;
