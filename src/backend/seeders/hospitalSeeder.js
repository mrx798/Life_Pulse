const db = require('../models');
const bcrypt = require('bcrypt');

const seedHospital = async () => {
  await db.sequelize.sync();
  const hashedPassword = await bcrypt.hash('hospital123', 12);
  await db.Hospital.create({
    name: 'City Hospital',
    email: 'hospital@lifepulse.com',
    password_hash: hashedPassword,
  });
  console.log('Hospital seeded');
};

seedHospital().then(() => process.exit());