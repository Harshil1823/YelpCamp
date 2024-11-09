const express = require('express');
// router doesn't get the params from the app.js route that's initalized
// so this param over here mergeParams make sure's you have access to it 
// here
const router = express.Router( { mergeParams : true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
// const { reviewSchema } = require('../schemas.js')
const { validateReview, isLoggedin, isReviewAuthor }= require('../middleware.js')
const reviews = require('../controllers/reviews.js');

router.post("/", isLoggedin, validateReview, catchAsync(reviews.createReviews));

router.delete('/:reviewId', isLoggedin, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
