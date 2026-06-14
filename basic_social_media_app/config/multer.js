const crypto = require('crypto');
const path = require('path');
const multer  = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/images')
  },
  filename: function (req, file, cb) {
    const randomString = crypto.randomBytes(16).toString('hex');
    const extension = path.extname(file.originalname);
    cb(null,randomString+extension)
  }
})

const upload = multer({ storage: storage })

module.exports=upload;