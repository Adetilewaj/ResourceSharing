const path = require('path');
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async');
const geocoder = require('../utils/geocoder');
const Handouts = require('../models/Handouts');
const Course = require('../models/Course');
const { error } = require('console');

// @desc   Get all handouts
// @route  GET /api/v1/handouts
// @access Public
exports.getHandouts = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc   Get single handout
// @route  GET /api/v1/handouts/:id
// @access Public
exports.getHandout = asyncHandler(async (req, res, next) => {
        const handout = await Handouts.findById(req.params.id);

        if(!handout) {
            return next (new ErrorResponse(`Handout not found with id of ${req.params.id}`,404));
        }

        res.status(200).json({ success: true, data: handout })
});

// @desc   Create new handout
// @route  POST /api/v1/handouts
// @access Private
exports.createHandout = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.user = req.user.id;

    // Check for published handouts
    const publishedHandouts = await Handouts.findOne({ user: req.user.id });

    // If the user is not an admin, they can only add one handout
    if (publishedHandouts && req.user.role !== 'admin') {
        return next(new ErrorResponse(`The user with ID ${req.user.id} has already published a handout`));
    }

    const handout = await Handouts.create(req.body);

    res.status(201).json({
    success: true,
    data: handout
    });
});

// @desc   Update handout
// @route  PUT /api/v1/handouts/:id
// @access Private
exports.updateHandout = asyncHandler(async (req, res, next) => {
    let handout = await Handouts.findById(req.params.id);

    if(!handout) {
        return next (new ErrorResponse(`Handout not found with id of ${req.params.id}`,404));
    }

    // Make sure user is handout owner
    if(handout.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next (new ErrorResponse(`User ${req.params.id} is not authorized to update this handout`,401));
    }

    handout = await Handouts.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    
    res.status(200).json({ success: true, data: handout });
});

// @desc   Delete handout
// @route  DELETE /api/v1/handouts/:id
// @access Private
exports.deleteHandout = asyncHandler(async (req, res, next) => {
    const handout = await Handouts.findByIdAndDelete(req.params.id);
    const course = await Course.deleteMany({ handouts: req.params.id });
        
    if(!handout) {
        return next (new ErrorResponse(`Handout not found with id of ${req.params.id}`,404));
    }

    // Make sure user is handout owner
    if(handout.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next (new ErrorResponse(`User ${req.params.id} is not authorized to delete this handout`,401));
    }

    res.status(200).json({ success: true, data: {} });
});

// @desc   Get handouts within a radius
// @route  GET /api/v1/handouts/radius/:zipcode/:distance
// @access Private
exports.getHandoutsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].latitude;

    // Calc radius using radians
    // Divide dist by radius of earth
    // Earth Radius = 3,963 mi / 6,378 km
    const radius = distance / 3963;

    const handout = await Handouts.find({
        location: { $geoWithin: { $centerSphere: [ [ lng, lat ], radius ] } }
    });

    res.status(200).json({
        status: true,
        count: handout.length,
        data: handout
    })
});

// @desc   Upload photo for bootcamp
// @route  PUT /api/v1/handouts/:id/photo
// @access Private
exports.handoutPhotoUpload = asyncHandler(async (req, res, next) => {
    const handout = await Handouts.findById(req.params.id);
    
    if(!handout) {
        return next (new ErrorResponse(`Handout not found with id of ${req.params.id}`,404));
    }

    // Make sure user is handout owner
    if(handout.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next (new ErrorResponse(`User ${req.params.id} is not authorized to update this handout`,401));
    }
    
    if (!req.files) {
        return next (new ErrorResponse(`Please upload a file`, 400));
    }

    const file = req.files.file;

    // Make sure the image is a photo
    if (!file.mimetype.startsWith('image')) {
        return next (new ErrorResponse(`Please upload an image file`, 400));
    }

    // Check file size
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next (new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
    }

    // Create custom filename
    file.name = `photo_${handout._id}${path.parse(file.name).ext}`;

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err);
            return next (new ErrorResponse(`Problem with file upload`, 500));
        }
        await Handouts.findByIdAndUpdate(req.params.id, { photo: file.name });

        res.status(200).json({
            success: true,
            data: file.name
        });
    })

    console.log(file.name);
});