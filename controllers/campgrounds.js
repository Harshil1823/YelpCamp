const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res, next) => {
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.features[0].geometry;
    //if (!req.body.campground) throw new ExpressError('invalid campground data', 400);

    // In a form, if you structure the field names like campground[title],
    // campground[location], etc.,  
    // they will be sent as an object within req.body under the campground key.
    // you can access that key with req.body.campground
    //const campground = new Campground(req.body.campground);
    campground.image = req.files.map(f => ({url : f.path, filename: f.filename }));
    //saving the author who created the campground
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'succesfully made a new campground')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate : {
            path : 'author'
        }
    }).populate('author');
    // todebug  -- console.log(`${campground}`)
    if (!campground) {
        req.flash('error', 'Error, unable to find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditform = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Error, unable to find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}

module.exports.updateCampground = async(req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    const imgs = req.files.map(f => ({url : f.path, filename: f.filename }));
    //want to push the new images on
    campground.image.push(...imgs);//spread operator passes the data onto the array
    await campground.save();
    if(req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull : {image : {filename : {$in : req.body.deleteImages}}}});
        console.log(campground);
    }
    ///////// console.log("Uploaded files:", req.files);
    req.flash('success', 'succesfully updated campground')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;    
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'succesfully deleted campground');
    res.redirect('/campgrounds');
}