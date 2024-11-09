const User = require('../models/user');


module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async(req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User( {email, username});
        //register method exist on passport
        // and it hashes the password
        const registerUser = await User.register(user, password);
        //from passport.js login function to automatic login the user
        // re
        req.login(registerUser, err => {
            if(err) {
                return next(err);
            } else {
                req.flash('success', 'welcome to yelp camp');
                res.redirect('/campgrounds');
            }
        })
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/campgrounds'; 
    res.redirect(redirectUrl);
    delete req.session.returnTo;
}

module.exports.logout = (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}