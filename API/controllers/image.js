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

const handleApiCall = () => (req, res) => {
	app.models.predict("a403429f2ddf4b49b307e318f00e528b", req.body.input)
	.then(data => {
		res.json(data);
	})
	.catch(err => res.status(400).json(-1));
}


const handleImage = (db) => (req, res) => {
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