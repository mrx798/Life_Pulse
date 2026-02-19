const db = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const auditService = require('../services/audit.service');

const login = async (req, res) => {
  try {
    const { email, password, type } = req.body; // type: 'donor' or 'hospital'
    let user;
    if (type === 'donor') {
      user = await db.Donor.findOne({ where: { email } });
      if (!user) return res.status(400).json({ error: 'Invalid credentials' });
      if (user.status !== 'APPROVED') {
        let msg = `Account not approved. Current status: ${user.status}`;
        if (user.status === 'pending_email_verification') msg = 'Please verify your email address.';
        if (user.status === 'pending_hospital_approval') msg = 'Your account is waiting for hospital approval.';
        if (user.status === 'REJECTED') msg = `Your account was rejected. Reason: ${user.rejection_reason || 'Not specified'}`;
        return res.status(403).json({ error: msg });
      }
    } else if (type === 'hospital') {
      user = await db.Hospital.findOne({ where: { email } });
      if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    } else {
      return res.status(400).json({ error: 'Invalid type' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, type: type.toUpperCase() }, config.jwtSecret);
    await auditService.log(type.toUpperCase(), user.id, 'Logged in');
    res.json({ token, user: { id: user.id, name: user.full_name || user.name, email: user.email, type } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const refresh = async (req, res) => {
  // Placeholder
  res.json({ message: 'Refresh not implemented' });
};

module.exports = {
  login,
  refresh,
};