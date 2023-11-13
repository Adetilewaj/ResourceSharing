const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async');
const Course = require('../models/Course');
const Handouts = require('../models/Handouts');
const { Query } = require('mongoose');

// @desc   Get all courses
// @route  GET /api/v1/courses
// @route  GET /api/v1/handouts/:handoutsId/courses
// @access Public
exports.getCourses = asyncHandler(async(req, res, next) => {
    if(req.params.handoutsId) {
        const courses = await Course.find({ handouts: req.params.handoutsId });

        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } else {
        res.status(200).json(res.advancedResults);
    }
});

// @desc   Get single course
// @route  GET /api/v1/courses/:id
// @access Public
exports.getCourse = asyncHandler(async(req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'handouts',
        select: 'name description'
    });

    if (!course) {
        return next(new ErrorResponse(`No course with id of ${req.params.id}`),404);
    }

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc   Add course
// @route  POST /api/v1/handouts/:handoutsId/courses
// @access Private
exports.addCourse = asyncHandler(async(req, res, next) => {
    req.body.handouts = req.params.handoutsId;
    req.body.user = req.user.id;

    const handouts = await Handouts.findById(req.params.handoutsId)

    if (!handouts) {
        return next(new ErrorResponse(`No handout with id of ${req.params.handoutsId}`),404);
    }

    // Make sure user is handout owner
    if(handouts.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next (new ErrorResponse(`User ${req.user.id} is not authorized to add a course to handout ${handouts._id}`,401));
    }

    const course = await Course.create(req.body);

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc   Update course
// @route  PUT /api/v1/courses/:id
// @access Private
exports.updateCourse = asyncHandler(async(req, res, next) => {
    let course = await Course.findById(req.params.id);

    if (!course) {
        return next(new ErrorResponse(`No course with id of ${req.params.id}`),404);
    }

    // Make sure user is course owner
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next (new ErrorResponse(`User ${req.user.id} is not authorized to update course ${course._id}`,401));
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: course
    });
});

// @desc   Delete course
// @route  DELETE /api/v1/courses/:id
// @access Private
exports.deleteCourse = asyncHandler(async(req, res, next) => {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
        return next(new ErrorResponse(`No course with id of ${req.params.id}`),404);
    }

    // Make sure user is course owner
    if(course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next (new ErrorResponse(`User ${req.user.id} is not authorized to delete course ${course._id}`,401));
    }

    res.status(200).json({
        success: true,
        data: {}
    });
});