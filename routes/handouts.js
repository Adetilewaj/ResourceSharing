const express = require('express');
const { 
    getHandouts, 
    getHandout, 
    createHandout, 
    updateHandout, 
    deleteHandout, 
    getHandoutsInRadius,
    handoutPhotoUpload
} = require('../controllers/handouts');

const Handouts = require('../models/Handouts');

// Include other resource routers
const courseRouter = require('./courses');

const router = express.Router();

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

// Re-route into other resource routers
router.use('/:handoutsId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getHandoutsInRadius);

router.route('/:id/photo').put(protect, authorize('lecturer', 'admin'), handoutPhotoUpload);

router.route('/').get(advancedResults(Handouts, 'courses'), getHandouts).post(protect, authorize('lecturer', 'admin'), createHandout);

router.route('/:id').get(getHandout).put(protect, authorize('lecturer', 'admin'), updateHandout).delete(protect, authorize('lecturer', 'admin'), deleteHandout);

module.exports = router;