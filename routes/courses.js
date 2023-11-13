const express = require('express');
const { getCourses, getCourse, addCourse, updateCourse, deleteCourse } = require('../controllers/courses');

const Course = require('../models/Course');
const advancedResults = require('../middleware/advancedResults')

const router = express.Router({ mergeParams: true });

const { protect, authorize } = require('../middleware/auth');

router
    .route('/')
    .get(advancedResults(Course, { 
        path: 'handouts',
        select: 'name description'
     }), getCourses)
    .post(protect, authorize('lecturer', 'admin'), addCourse);

router
    .route('/:id')
    .get(getCourse)
    .put(protect, authorize('lecturer', 'admin'), updateCourse)
    .delete(protect, authorize('lecturer', 'admin'), deleteCourse);

module.exports = router;