const db = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');
const geoService = require('../services/geo.service');
const notifyService = require('../services/notify.service');
const auditService = require('../services/audit.service');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hospital = await db.Hospital.findOne({ where: { email } });
    if (!hospital || !await bcrypt.compare(password, hospital.password_hash)) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: hospital.id, type: 'HOSPITAL_ADMIN' }, config.jwtSecret);
    await auditService.log('HOSPITAL_ADMIN', hospital.id, 'Logged in');
    res.json({ token, user: { id: hospital.id, name: hospital.name, email: hospital.email, type: 'hospital' } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalDonors = await db.Donor.count();
    const pendingDonors = await db.Donor.count({ where: { status: 'PENDING' } });
    const approvedDonors = await db.Donor.count({ where: { status: 'APPROVED' } });
    const rejectedDonors = await db.Donor.count({ where: { status: 'REJECTED' } });
    res.json({ totalDonors, pendingDonors, approvedDonors, rejectedDonors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPendingDonors = async (req, res) => {
  try {
    const donors = await db.Donor.findAll({
      where: { status: 'PENDING' },
      attributes: { exclude: ['password_hash'] }
    });
    res.json({ donors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const approveDonor = async (req, res) => {
  try {
    const { id } = req.params;
    const [affectedRows] = await db.Donor.update({ status: 'APPROVED' }, { where: { id: parseInt(id) } });
    if (affectedRows === 0) return res.status(404).json({ error: 'Donor not found' });
    await auditService.log('HOSPITAL_ADMIN', req.user.id, `Approved donor ${id}`);
    res.json({ message: 'Donor approved' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const rejectDonor = async (req, res) => {
  try {
    const { id } = req.params;
    const [affectedRows] = await db.Donor.update({ status: 'REJECTED' }, { where: { id: parseInt(id) } });
    if (affectedRows === 0) return res.status(404).json({ error: 'Donor not found' });
    await auditService.log('HOSPITAL_ADMIN', req.user.id, `Rejected donor ${id}`);
    res.json({ message: 'Donor rejected' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createRequest = async (req, res) => {
  try {
    const { blood_group_needed, latitude, longitude, radius_km } = req.body;
    const request_code = uuidv4().substring(0, 8).toUpperCase();
    const request = await db.BloodRequest.create({
      request_code,
      hospital_id: req.user.id,
      blood_group_needed,
      latitude,
      longitude,
      radius_km: radius_km || 5,
    });
    await auditService.log('HOSPITAL_ADMIN', req.user.id, `Created request ${request.id}`);
    res.json({ request });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const notifyDonors = async (req, res) => {
  try {
    const { request_id } = req.body;
    const request = await db.BloodRequest.findByPk(parseInt(request_id));
    if (!request) return res.status(404).json({ error: 'Request not found' });

    // Find approved, available donors with matching blood group within radius
    let where = {
      status: 'APPROVED',
      is_available: true,
      blood_group: request.blood_group_needed,
    };
    if (request.latitude && request.longitude) {
      const { minLat, maxLat, minLon, maxLon } = geoService.getBoundingBox(request.latitude, request.longitude, request.radius_km);
      where.latitude = { [db.Sequelize.Op.between]: [minLat, maxLat] };
      where.longitude = { [db.Sequelize.Op.between]: [minLon, maxLon] };
    }
    const donors = await db.Donor.findAll({ where });

    // Filter by exact distance
    let filteredDonors = donors;
    if (request.latitude && request.longitude) {
      filteredDonors = donors.filter(d => {
        if (!d.latitude || !d.longitude) return false;
        const distance = geoService.calculateDistance(request.latitude, request.longitude, d.latitude, d.longitude);
        return distance <= request.radius_km;
      });
    }

    const notifications = await notifyService.notifyDonors(request_id, filteredDonors.map(d => d.id));
    await auditService.log('HOSPITAL_ADMIN', req.user.id, `Notified ${filteredDonors.length} donors for request ${request_id}`);
    res.json({ notifications, count: filteredDonors.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRequests = async (req, res) => {
  try {
    const requests = await db.BloodRequest.findAll({
      where: { hospital_id: req.user.id },
      include: [{ model: db.NotificationLog, include: [db.Donor] }],
    });
    res.json({ requests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllDonors = async (req, res) => {
  try {
    const donors = await db.Donor.findAll({ attributes: { exclude: ['password_hash'] } });
    res.json({ donors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  login,
  getDashboardStats,
  getPendingDonors,
  approveDonor,
  rejectDonor,
  getAllDonors,
};