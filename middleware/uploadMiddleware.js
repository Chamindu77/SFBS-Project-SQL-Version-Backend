const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
  destination: './uploads/images',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, 
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).single('image');

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

module.exports = upload;