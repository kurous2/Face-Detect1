const Clarifai = require('clarifai');

//You must add your own API key here from Clarifai. 
const app = new Clarifai.App({
 apiKey: '110c6bcb631d4457b4fed5b4c08fe118'
});

var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})


const cloudinary = require("cloudinary");
cloudinary.config({ 
  cloud_name: 'kuro2', 
  api_key: '183236217275828', 
  api_secret: '4vqzAGpU9fBKMg2VhmSLVHovvv8'
});


const handleImageUpload = () => (req, res) => {
	console.log(req.files);
	const values = Object.values(req.files);
  const promises = values.map(image => cloudinary.uploader.upload(image.path));
  
  Promise
    .all(promises)
    .then(results => res.json(results));
}

function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}


const handleApiCall = (req, res) => {
  app.models
    // HEADS UP! Sometimes the Clarifai Models can be down or not working as they are constantly getting updated.
    // A good way to check if the model you are using is up, is to check them on the clarifai website. For example,
    // for the Face Detect Mode: https://www.clarifai.com/models/face-detection
    // If that isn't working, then that means you will have to wait until their servers are back up. Another solution
    // is to use a different version of their model that works like: `c0c0ac362b03416da06ab3fa36fb58e3`
    // so you would change from:
    // .predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
    // to:
    // .predict('c0c0ac362b03416da06ab3fa36fb58e3', req.body.input)
    .predict("a403429f2ddf4b49b307e318f00e528b", req.body.input)
    .then(data => {
      res.json(data);
    })
    .catch(err => res.status(400).json(-1))
}

const handleImage = (req, res, db) => {
  const { id } = req.body;
  db('users').where('id', '=', id)
  .increment('entries', 1)
  .returning('entries')
  .then(entries => {
    res.json(entries[0]);
  })
  .catch(err => res.status(400).json('unable to get entries'))
}

module.exports = {handleImage, handleApiCall, handleImageUpload}