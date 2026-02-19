const app = require('./app');
const PORT = process.env.PORT || 3000;

const db = require('./models');

const startServer = async () => {
  try {
    console.log('Syncing database...');
    await db.sequelize.sync(); // Removed { alter: true } to prevent constraint errors
    console.log('Database synced. Starting server...');

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.on('error', (err) => {
      console.error('Server failed to start:', err);
    });

  } catch (error) {
    console.error('Failed to sync database:', error);
  }
};

startServer();

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection request:', promise, 'reason:', reason);
});