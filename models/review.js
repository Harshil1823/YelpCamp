//importing mongoose to interact with MongoDB
const mongoose = require('mongoose');
// Assigning mongoose.Schema to a variable for convenience
const Schema = mongoose.Schema;

const reviewSchema = new Schema ({
    body : String,
    rating : Number,
    author : {
        type: Schema.Types.ObjectId,
        ref : 'User'
    }
});


module.exports = mongoose.model("Review", reviewSchema);