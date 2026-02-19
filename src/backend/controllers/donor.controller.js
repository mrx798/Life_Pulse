const db = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const auditService = require('../services/audit.service');
const { v4: uuidv4 } = require('uuid');
const validator = require('validator');
const otpService = require('../services/otp.service');

const register = async (req, res) => {
  try {
    const { full_name, email, password, blood_group, area, latitude, longitude, phone, consent_given } = req.body;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    let donor = await db.Donor.findOne({ where: { email } });

    if (donor) {
      if (donor.status === 'APPROVED') {
        return res.status(400).json({ error: 'Email already registered and approved. Please login.' });
      } else if (donor.status === 'REJECTED') {
        return res.status(400).json({ error: 'This email has been rejected previously.' });
      }

      // If pending, update details and resend OTP
      const password_hash = await bcrypt.hash(password, 12);
      await donor.update({
        full_name,
        password_hash,
        phone,
        blood_group,
        area,
        latitude,
        longitude,
        consent_given,
        status: 'pending_email_verification' // Reset status to ensure email verification
      });

    } else {
      // Create new donor
      const password_hash = await bcrypt.hash(password, 12);
      const donor_code = uuidv4().substring(0, 8).toUpperCase();

      donor = await db.Donor.create({
        donor_code,
        full_name,
        email,
        password_hash,
        phone,
        blood_group,
        area,
        latitude,
        longitude,
        consent_given,
        status: 'pending_email_verification',
      });
    }

    // Generate and send OTP
    // const otp = await otpService.generateOTP(email); <--- Removed duplicate call if following logic is used, but better to keep it clean.
    // Let's restructure to be cleaner.

    const otp = await otpService.generateOTP(email);

    await auditService.log('DONOR', donor.id, 'Registered/Updated (Pending Email Verification)');

    res.json({
      message: 'Registration successful. An OTP has been sent to your email.',
      email: donor.email,
      requires_otp: true
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    await otpService.verifyOTP(email, otp);

    const donor = await db.Donor.findOne({ where: { email } });
    if (!donor) return res.status(404).json({ error: 'Donor not found' });

    // Update status to pending_hospital_approval
    await donor.update({ status: 'pending_hospital_approval' });
    await auditService.log('DONOR', donor.id, 'Verified Email');

    res.json({ message: 'Email verified. Your account is now pending hospital approval.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const donor = await db.Donor.findOne({ where: { email } });
    if (!donor || !await bcrypt.compare(password, donor.password_hash)) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    if (donor.status !== 'APPROVED') {
      return res.status(403).json({ error: 'Account not approved yet' });
    }
    const token = jwt.sign({ id: donor.id, type: 'DONOR' }, config.jwtSecret);
    await auditService.log('DONOR', donor.id, 'Logged in');
    res.json({ token, user: { id: donor.id, name: donor.full_name, email: donor.email, type: 'donor' } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const donor = await db.Donor.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });
    res.json({ donor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { full_name, phone, area, latitude, longitude, is_available } = req.body;
    const updateData = { full_name, phone, area, latitude, longitude };
    if (is_available !== undefined) updateData.is_available = is_available;
    await db.Donor.update(updateData, { where: { id: req.user.id } });
    const donor = await db.Donor.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });
    await auditService.log('DONOR', req.user.id, 'Updated profile');
    res.json({ donor });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await db.NotificationLog.findAll({
      where: { donor_id: req.user.id },
      include: [{ model: db.BloodRequest, include: [db.Hospital] }],
      order: [['notified_at', 'DESC']],
    });
    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const respondToRequest = async (req, res) => {
  try {
    const { notification_id, response } = req.body;
    const log = await db.NotificationLog.findOne({ where: { id: parseInt(notification_id), donor_id: req.user.id } });
    if (!log) return res.status(404).json({ error: 'Notification not found' });
    await log.update({ response, response_at: new Date() });
    await auditService.log('DONOR', req.user.id, `Responded ${response} to notification ${notification_id}`);
    res.json({ log });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  register,
  verifyEmail,
  login,
  getProfile,
  updateProfile,
  getNotifications,
  respondToRequest,
};