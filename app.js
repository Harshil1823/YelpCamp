
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// Importing the express module
const express = require('express');
// Importing the path module to handle file and directory paths
const path = require('path');
// require mongoose
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js')
const MongoStore = require('connect-mongo');


//const dbUrl = process.env.DB_URL;
//mongodb://127.0.0.1:27017/yelp-camp';
const dbUrl = process.env.DB_URL;
// mongoose.connect(dbUrl, {
// });


//getting the routes set up here
const userRoutes = require('./routes/user.js')
const campgroundRoutes = require('./routes/campgrounds.js');
const reviewRoutes = require('./routes/reviews.js')
const mongoSanitize = require('express-mongo-sanitize');

//mongodb://127.0.0.1:27017/yelp-camp'
// open connection with mongoose
// called /yelp-camp
mongoose.connect(dbUrl, {

});


const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log("Database connected")
})

// Initializing the express application
const app = express();
// parse the request.body 
app.use(express.urlencoded( { extended : true}));
app.use(methodOverride('_method'));

app.engine('ejs', ejsMate)
// Setting the view engine to EJS (Embedded JavaScript)
app.set('view engine', 'ejs');
// Setting the views directory to a specific path
app.set('views', path.join(__dirname, 'views'));
//setting the public directory to a specific path
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const store = new MongoStore ({
    mongoUrl: dbUrl,  // Use mongoUrl instead of url
    secret: 'thisshouldbeabettersecret',
    touchAfter: 24 * 60 * 60  // 24 hours in seconds
})
store.on('error', function(err) {
    console.log('session store', err);
} )

const sessionConfig = {
    store, 
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie : {
        httpOnly : true,
        expires : Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge : (1000 * 60 * 60 * 24 * 7)
    }
}

app.use(session(sessionConfig));
app.use(flash());

//globalize middleware
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

//how to store or unstore the user that checks in 
// passport.js documentation
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/fakeUser', async (req, res) => {
    const user = new User({email : 'coltt@gmail.com', username : 'colt123'})
    const newUser = await User.register(user, 'chicken');
    res.send(newUser);
})

app.use((req, res, next) => {
    console.log(req.query);
    //console.log(req.session);
    //gives access to all the ejs template to access these 
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// how the routes will be used
app.use('/', userRoutes)
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)



// Defining a route for the root URL ("/")
// When a GET request is made to "/", it renders the 'home' template
app.get('/', (req, res) => {
    res.render('home');
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something went wrong!'
    res.status(statusCode).render('error', { err });  // passing the error status here so we can use it here 
                                                        // passing the whole error rather than destructuring it
})

// make a document (object and save it in mongoDB )
// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground( {title: 'My Backyard', description : 'cheap camping' })
//     await camp.save();
//     res.send(camp);
// });

// Starting the server on port 3000 and logging a message when it's running
app.listen(3000, (req, res) => {
    console.log('Serving on port 3000!');
});
