const express = require('express');
const router = express.Router();
const { getProperties, getPropertyDetail, getCompare, toggleFavorite, getFavorites, postInquiry, postReview, flagProperty } = require('../controllers/propertyController');
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/', getProperties);
router.get('/compare', getCompare);
router.get('/favorites', ensureAuthenticated, getFavorites);
router.get('/:id', getPropertyDetail);
router.post('/:id/favorite', ensureAuthenticated, toggleFavorite);
router.post('/:id/inquiry', ensureAuthenticated, postInquiry);
router.post('/:id/review', ensureAuthenticated, postReview);
router.post('/:id/flag', ensureAuthenticated, flagProperty);

module.exports = router;
