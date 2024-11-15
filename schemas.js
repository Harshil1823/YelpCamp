const Joi = require('joi');


//note mongoose scehma this will validated before passing it to mongoose
module.exports.campgroundSchema = Joi.object({
    campground : Joi.object({
        title : Joi.string().required(),
        price : Joi.number().required().min(0),
        location: Joi.string().required(),
        description : Joi.string().required(),
    }).required(),
    deleteImages: Joi.array()
})

module.exports.reviewSchema = Joi.object({
    review : Joi.object({
        body : Joi.string().required(),
        rating : Joi.number().required().min(1).max(5),
    }).required()
})