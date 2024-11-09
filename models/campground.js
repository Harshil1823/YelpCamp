//importing mongoose to interact with MongoDB
const mongoose = require('mongoose');
// Assigning mongoose.Schema to a variable for convenience
const Schema = mongoose.Schema;
const Review = require('./review');

const ImageSchema = new Schema({
    url : String,
    filename: String
});
// not using this below
// just added html thumbnail class from bootstrap
ImageSchema.virtual('thumbnail').get(function () {
    const modifiedUrl = this.url.replace('/upload', '/upload/w_200');
    return modifiedUrl;
});


const CampgroundSchema = new Schema({
    title: String,
    image: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ]
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } });


// The post middleware gets called after a document is deleted using findOneAndDelete.
// It triggers after the 'findOneAndDelete' operation is completed.
// In this case, after a campground is deleted, this middleware will also delete associated reviews.
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    // 'doc' refers to the deleted campground document.
    // If the document exists (meaning it was found and deleted successfully), proceed to delete associated reviews.
    if (doc) {
        // The reviews field in the Campground schema stores an array of ObjectIds (references to Review documents).
        // Using $in operator to match any review whose _id is in the array of doc.reviews.
        // This ensures that all the reviews related to this deleted campground are also deleted.
        await Review.deleteMany({
            _id: {
                $in: doc.reviews // doc.reviews contains the ObjectIds of reviews associated with the campground.
            }
        });
    }
});


// Exporting the model based on the Campground schema
// 'Campground' is the name of the model, and Mongoose will create a collection named 
// 'campgrounds' (pluralized)
// This model represents the Campground collection in MongoDB, 
// and we can use it to interact with the data
module.exports = mongoose.model('Campground', CampgroundSchema); 
