const Property = require('../models/Property');
const User = require('../models/User');
const Inquiry = require('../models/Inquiry');
const Review = require('../models/Review');

exports.getDashboard = async (req, res) => {
  try {
    const totalProperties = await Property.countDocuments();
    const pendingProperties = await Property.countDocuments({ status: 'pending' });
    const approvedProperties = await Property.countDocuments({ status: 'approved' });
    const rejectedProperties = await Property.countDocuments({ status: 'rejected' });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalAgents = await User.countDocuments({ role: 'agent' });
    const totalInquiries = await Inquiry.countDocuments();
    const flaggedProperties = await Property.countDocuments({ isFlagged: true });
    const recentProperties = await Property.find().populate('agent', 'name').sort({ createdAt: -1 }).limit(5);
    const monthlyCounts = await getMonthlyStats();
    res.render('admin/dashboard', { title: 'Admin Dashboard', totalProperties, pendingProperties, approvedProperties, rejectedProperties, totalUsers, totalAgents, totalInquiries, flaggedProperties, recentProperties, monthlyCounts: JSON.stringify(monthlyCounts) });
  } catch (err) { console.error(err); res.redirect('/'); }
};

async function getMonthlyStats() {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const count = await Property.countDocuments({ createdAt: { $gte: start, $lte: end } });
    months.push({ month: start.toLocaleString('default', { month: 'short' }), count });
  }
  return months;
}

exports.getPendingProperties = async (req, res) => {
  try {
    const properties = await Property.find({ status: 'pending' }).populate('agent', 'name email').sort({ createdAt: -1 });
    res.render('admin/pending', { title: 'Pending Listings', properties });
  } catch (err) { res.redirect('/admin/dashboard'); }
};

exports.approveProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    await User.findByIdAndUpdate(property.agent, { $push: { notifications: { message: `Your listing "${property.title}" has been approved!` } } });
    req.flash('success_msg', 'Property approved');
    res.redirect('/admin/pending');
  } catch (err) { res.redirect('/admin/pending'); }
};

exports.rejectProperty = async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    await User.findByIdAndUpdate(property.agent, { $push: { notifications: { message: `Your listing "${property.title}" was rejected. Please review and resubmit.` } } });
    req.flash('success_msg', 'Property rejected');
    res.redirect('/admin/pending');
  } catch (err) { res.redirect('/admin/pending'); }
};

exports.getAllProperties = async (req, res) => {
  try {
    const properties = await Property.find().populate('agent', 'name').sort({ createdAt: -1 });
    res.render('admin/all-properties', { title: 'All Properties', properties });
  } catch (err) { res.redirect('/admin/dashboard'); }
};

exports.getFlaggedProperties = async (req, res) => {
  try {
    const properties = await Property.find({ isFlagged: true }).populate('agent', 'name email').sort({ createdAt: -1 });
    res.render('admin/flagged', { title: 'Flagged Properties', properties });
  } catch (err) { res.redirect('/admin/dashboard'); }
};

exports.clearFlag = async (req, res) => {
  try {
    await Property.findByIdAndUpdate(req.params.id, { isFlagged: false, flagReason: '' });
    req.flash('success_msg', 'Flag cleared');
    res.redirect('/admin/flagged');
  } catch (err) { res.redirect('/admin/flagged'); }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 });
    res.render('admin/users', { title: 'Manage Users', users });
  } catch (err) { res.redirect('/admin/dashboard'); }
};

exports.toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    req.flash('success_msg', `User ${user.isActive ? 'activated' : 'deactivated'}`);
    res.redirect('/admin/users');
  } catch (err) { res.redirect('/admin/users'); }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    req.flash('success_msg', 'User deleted');
    res.redirect('/admin/users');
  } catch (err) { res.redirect('/admin/users'); }
};
