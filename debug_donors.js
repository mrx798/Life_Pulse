const db = require('./src/backend/models');

const checkDonors = async () => {
    try {
        const donors = await db.Donor.findAll({
            where: {
                email: ['yuvashree2005m@gmail.com', 'sharathilan@gmail.com', 'kishore8020@gmail.com']
            }
        });

        console.log('--- DONOR STATUS REPORT ---');
        donors.forEach(d => {
            console.log(`Email: ${d.email} | Status: ${d.status} | ID: ${d.id}`);
        });
        console.log('---------------------------');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close connection immediately
        await db.sequelize.close();
    }
};

checkDonors();
