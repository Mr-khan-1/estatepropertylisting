const Property = require('../models/Property');
const Review = require('../models/Review');
const Inquiry = require('../models/Inquiry');
const User = require('../models/User');

exports.getHome = async (req, res) => {
  try {
    const featuredProperties = await Property.find({ status: 'approved' }).populate('agent', 'name').sort({ createdAt: -1 }).limit(6);
    const totalProperties = await Property.countDocuments({ status: 'approved' });
    const totalAgents = await User.countDocuments({ role: 'agent' });
    res.render('index', { title: 'Home', featuredProperties, totalProperties, totalAgents });
  } catch (err) { console.error(err); res.render('index', { title: 'Home', featuredProperties: [], totalProperties: 0, totalAgents: 0 }); }
};

exports.getProperties = async (req, res) => {
  try {
    const { type, category, city, minPrice, maxPrice, bedrooms, sort } = req.query;
    let query = { status: 'approved' };
    if (type) query.type = type;
    if (category) query.category = category;
    if (city) query.city = new RegExp(city, 'i');
    if (minPrice || maxPrice) { query.price = {}; if (minPrice) query.price.$gte = Number(minPrice); if (maxPrice) query.price.$lte = Number(maxPrice); }
    if (bedrooms) query.bedrooms = { $gte: Number(bedrooms) };
    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'oldest') sortOption = { createdAt: 1 };
    const properties = await Property.find(query).populate('agent', 'name phone').sort(sortOption);
    res.render('user/properties', { title: 'Properties', properties, query: req.query });
  } catch (err) { console.error(err); res.redirect('/'); }
};

exports.getPropertyDetail = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('agent', 'name email phone avatar');
    if (!property || property.status !== 'approved') { req.flash('error_msg', 'Property not found'); return res.redirect('/properties'); }
    await Property.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    const reviews = await Review.find({ property: req.params.id }).populate('user', 'name avatar').sort({ createdAt: -1 });
    const avgRating = reviews.length ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;
    const relatedProperties = await Property.find({ city: property.city, status: 'approved', _id: { $ne: property._id } }).limit(3);
    let userFavorited = false;
    let userReviewed = false;
    if (req.user) {
      const user = await User.findById(req.user._id);
      userFavorited = user.favorites.includes(property._id);
      userReviewed = reviews.some(r => r.user._id.toString() === req.user._id.toString());
    }
    res.render('user/property-detail', { title: property.title, property, reviews, avgRating, relatedProperties, userFavorited, userReviewed });
  } catch (err) { console.error(err); res.redirect('/properties'); }
};

exports.getCompare = async (req, res) => {
  try {
    const { ids } = req.query;
    let properties = [];
    let compareStats = {
      bestValue: null,
      lowestPrice: 0,
      lowestPricePerSqft: 0,
      maxBedrooms: 0,
      maxBathrooms: 0,
      maxArea: 0,
      maxAmenities: 0,
      bestScore: 0
    };
    let compareSummary = {
      bestTitle: '—',
      bestScore: '—',
      lowestPrice: '—',
      lowestPricePerSqft: '—',
      maxBedrooms: 0,
      maxAmenities: 0,
      maxArea: '—'
    };
    if (ids) {
      const idArray = ids.split(',').slice(0, 3);
      properties = await Property.find({ _id: { $in: idArray }, status: 'approved' }).populate('agent', 'name').lean();
      if (properties.length > 0) {
        properties = properties.map(p => {
          const pricePerSqft = p.area ? p.price / p.area : Number.MAX_SAFE_INTEGER;
          const amenitiesCount = Array.isArray(p.amenities) ? p.amenities.length : 0;
          const finalScore = Math.round((p.bedrooms * 2 + p.bathrooms * 1.5 + Math.log(Math.max(p.area, 1)) * 2 + amenitiesCount * 1.2) * 10 - pricePerSqft * 0.03);
          return { ...p, pricePerSqft, amenitiesCount, compareScore: finalScore };
        });
        compareStats = {
          bestValue: properties.reduce((best, prop) => prop.compareScore > best.compareScore ? prop : best, properties[0]),
          lowestPrice: Math.min(...properties.map(p => p.price)),
          lowestPricePerSqft: Math.min(...properties.map(p => p.pricePerSqft)),
          maxBedrooms: Math.max(...properties.map(p => p.bedrooms)),
          maxBathrooms: Math.max(...properties.map(p => p.bathrooms)),
          maxArea: Math.max(...properties.map(p => p.area)),
          maxAmenities: Math.max(...properties.map(p => p.amenitiesCount)),
          bestScore: Math.max(...properties.map(p => p.compareScore))
        };
        compareSummary = {
          bestTitle: compareStats.bestValue.title,
          bestScore: compareStats.bestScore,
          lowestPrice: 'PKR ' + compareStats.lowestPrice.toLocaleString(),
          lowestPricePerSqft: 'PKR ' + compareStats.lowestPricePerSqft.toFixed(0),
          maxBedrooms: compareStats.maxBedrooms,
          maxAmenities: compareStats.maxAmenities,
          maxArea: compareStats.maxArea + ' sqft'
        };
      }
    }
    res.render('user/compare', { title: 'Compare Properties', properties, compareStats, compareSummary });
  } catch (err) {
    console.error(err);
    res.redirect('/properties');
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const propId = req.params.id;
    const idx = user.favorites.indexOf(propId);
    if (idx === -1) { user.favorites.push(propId); await user.save(); return res.json({ favorited: true }); }
    user.favorites.splice(idx, 1); await user.save();
    res.json({ favorited: false });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
};

exports.getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({ path: 'favorites', match: { status: 'approved' }, populate: { path: 'agent', select: 'name' } });
    res.render('user/favorites', { title: 'My Favorites', properties: user.favorites });
  } catch (err) { console.error(err); res.redirect('/'); }
};

exports.postInquiry = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) { req.flash('error_msg', 'Property not found'); return res.redirect('/properties'); }
    const { message, phone, email } = req.body;
    const inquiry = new Inquiry({ property: property._id, sender: req.user._id, agent: property.agent, message, phone, email });
    await inquiry.save();
    await User.findByIdAndUpdate(property.agent, { $push: { notifications: { message: `New inquiry for "${property.title}"` } } });
    req.flash('success_msg', 'Inquiry sent successfully!');
    res.redirect(`/properties/${req.params.id}`);
  } catch (err) { console.error(err); res.redirect('/properties'); }
};

exports.postReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const existing = await Review.findOne({ property: req.params.id, user: req.user._id });
    if (existing) { req.flash('error_msg', 'You have already reviewed this property'); return res.redirect(`/properties/${req.params.id}`); }
    const review = new Review({ property: req.params.id, user: req.user._id, rating: Number(rating), comment });
    await review.save();
    req.flash('success_msg', 'Review submitted!');
    res.redirect(`/properties/${req.params.id}`);
  } catch (err) { console.error(err); res.redirect('/properties'); }
};

exports.flagProperty = async (req, res) => {
  try {
    const { reason } = req.body;
    await Property.findByIdAndUpdate(req.params.id, { isFlagged: true, flagReason: reason });
    req.flash('success_msg', 'Property reported. Admin will review it.');
    res.redirect(`/properties/${req.params.id}`);
  } catch (err) { res.redirect('/properties'); }
};
