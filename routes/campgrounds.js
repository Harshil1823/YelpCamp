const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
const { isLoggedin, validateCampground, isAuthor } = require('../middleware.js')
const campgrounds = require('../controllers/campgrounds.js');
const multer = require('multer');
const { storage } = require('../cloudinary')
const upload = multer({ storage });

router.route('/')
    .get(catchAsync (campgrounds.index))
    .post(isLoggedin, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground));
    

//new need to be before id so it matches wit new
router.get('/new', isLoggedin, campgrounds.renderNewForm);


router.route('/:id')
        .get(catchAsync(campgrounds.showCampground))
        .put(isLoggedin, 
            isAuthor, upload.array('image'), validateCampground, 
            catchAsync(campgrounds.updateCampground))
        .delete(isLoggedin, 
            isAuthor, 
            catchAsync(campgrounds.deleteCampground));
            

router.get('/:id/edit', isLoggedin, 
    isAuthor, 
    catchAsync(campgrounds.renderEditform))

module.exports = router;


