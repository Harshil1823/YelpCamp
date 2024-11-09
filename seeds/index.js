// require mongoose
const mongoose = require('mongoose');
// importing the campground model and requiring it
// require Campground model
const Campground = require('../models/campground');
// importing the array cities
const cities = require('./cities')
const { places, descriptors} = require('./seedHelpers'); 
const { coordinates } = require('@maptiler/client');

// open connection with mongoose
// called /yelp-camp
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected")
})

// function to select a random element from an array 
// Math.random() generates a random number between 0 and 1
// Multiplying by array.length ensures the range is between 0 and the array's length
// Math.floor() rounds down to the nearest whole number (index)
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({}); // Deletes all existing campgrounds
    for (let i = 0; i < 50; i++) {
        // Since there are 1000 cities in the cities array
        const random1000 = Math.floor(Math.random() * 1000); // Picks a random city
        const price = Math.floor(Math.random() * 20) + 10
        const camp = new Campground({
            author : '671bccf225b16ee263c9d4da',
            location: `${cities[random1000].city}, ${cities[random1000].state}`, // Correct string interpolation
            title : `${sample(descriptors)} ${sample(places)}`,
            geometry : {
                type: "point",
                coordinates:[-113.1331, 47.0202]
            },
            image : [
                {
                    url: 'https://res.cloudinary.com/dksldpvle/image/upload/v1730763934/YelpCamp/bjbfufqjhkmbthzhjiax.jpg',
                    filename: 'YelpCamp/bjbfufqjhkmbthzhjiax',
                  },
                  {
                    url: 'https://res.cloudinary.com/dksldpvle/image/upload/v1730763934/YelpCamp/x16pkwfobtjcpjetyahb.jpg',
                    filename: 'YelpCamp/x16pkwfobtjcpjetyahb',
                  }
            ],
            description : `Some random desripiton will be here in future!`,
            price
        });
        await camp.save(); // Saves the new campground to the database
    }
}
// Calls the seedDB function to run the seeding process
seedDB().then( () => {
    mongoose.connection.close(); // close the connection once it's done running the function
})
