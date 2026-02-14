const db = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');

const login = async (email, password) => {
  // This can be used for both donor and hospital, but for now, separate
  throw new Error('Use specific login methods');
};

module.exports = {
  login,
};