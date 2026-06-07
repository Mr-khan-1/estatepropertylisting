const Property = require('../models/Property');
const Inquiry = require('../models/Inquiry');
const User = require('../models/User');

exports.getDashboard = async (req, res) => {
  try {
    const myProperties = await Property.find({ agent: req.user._id }).sort({ createdAt: -1 });
    const totalListings = myProperties.length;
    const approvedListings = myProperties.filter(p => p.status === 'approved').length;
    const pendingListings = myProperties.filter(p => p.status === 'pending').length;
    const inquiries = await Inquiry.find({ agent: req.user._id }).populate('property', 'title').populate('sender', 'name').sort({ createdAt: -1 }).limit(5);
    const unreadInquiries = await Inquiry.countDocuments({ agent: req.user._id, isRead: false });
    res.render('agent/dashboard', { title: 'Agent Dashboard', myProperties, totalListings, approvedListings, pendingListings, inquiries, unreadInquiries });
  } catch (err) { console.error(err); res.redirect('/'); }
};

exports.getAddProperty = (req, res) => res.render('agent/add-property', { title: 'Add Property' });

exports.postAddProperty = async (req, res) => {
  try {
    const { title, description, price, type, category, bedrooms, bathrooms, area, address, city, state, zipCode, lat, lng, amenities } = req.body;
    const images = req.files ? req.files.map(f => f.filename) : [];
    const amenityList = amenities ? (Array.isArray(amenities) ? amenities : [amenities]) : [];
    const property = new Property({ title, description, price: Number(price), type, category, bedrooms: Number(bedrooms) || 0, bathrooms: Number(bathrooms) || 0, area: Number(area) || 0, address, city, state: state || '', zipCode: zipCode || '', lat: Number(lat) || 0, lng: Number(lng) || 0, images, amenities: amenityList, agent: req.user._id });
    await property.save();
    req.flash('success_msg', 'Property submitted for review!');
    res.redirect('/agent/dashboard');
  } catch (err) { console.error(err); req.flash('error_msg', 'Error adding property'); res.redirect('/agent/add-property'); }
};

exports.getEditProperty = async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, agent: req.user._id });
    if (!property) { req.flash('error_msg', 'Property not found'); return res.redirect('/agent/dashboard'); }
    res.render('agent/edit-property', { title: 'Edit Property', property });
  } catch (err) { res.redirect('/agent/dashboard'); }
};

exports.postEditProperty = async (req, res) => {
  try {
    const { title, description, price, type, category, bedrooms, bathrooms, area, address, city, state, zipCode, lat, lng, amenities } = req.body;
    const amenityList = amenities ? (Array.isArray(amenities) ? amenities : [amenities]) : [];
    const update = { title, description, price: Number(price), type, category, bedrooms: Number(bedrooms) || 0, bathrooms: Number(bathrooms) || 0, area: Number(area) || 0, address, city, state: state || '', zipCode: zipCode || '', lat: Number(lat) || 0, lng: Number(lng) || 0, amenities: amenityList, status: 'pending' };
    if (req.files && req.files.length > 0) update.images = req.files.map(f => f.filename);
    await Property.findOneAndUpdate({ _id: req.params.id, agent: req.user._id }, update);
    req.flash('success_msg', 'Property updated and resubmitted for review');
    res.redirect('/agent/dashboard');
  } catch (err) { console.error(err); res.redirect('/agent/dashboard'); }
};

exports.deleteProperty = async (req, res) => {
  try {
    await Property.findOneAndDelete({ _id: req.params.id, agent: req.user._id });
    req.flash('success_msg', 'Property deleted');
    res.redirect('/agent/dashboard');
  } catch (err) { res.redirect('/agent/dashboard'); }
};

exports.getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ agent: req.user._id }).populate('property', 'title images').populate('sender', 'name email').sort({ createdAt: -1 });
    await Inquiry.updateMany({ agent: req.user._id, isRead: false }, { isRead: true });
    res.render('agent/inquiries', { title: 'Inquiries', inquiries });
  } catch (err) { res.redirect('/agent/dashboard'); }
};

exports.getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    await User.findByIdAndUpdate(req.user._id, { 'notifications.$[].read': true });
    res.render('agent/notifications', { title: 'Notifications', notifications: user.notifications.reverse() });
  } catch (err) { res.redirect('/agent/dashboard'); }
};
