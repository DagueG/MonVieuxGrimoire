const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    const name = file.originalname.split(' ').join('_');
    const extension = file.mimetype.split('/')[1];
    cb(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({ storage: storage }).single('image');
