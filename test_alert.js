const http = require('http');

const post = (path, data, token) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject({ status: res.statusCode, data: parsed });
                    }
                } catch (e) {
                    reject({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (e) => reject(e));
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
};

const get = (path, token) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject({ status: res.statusCode, data: parsed });
                    }
                } catch (e) {
                    reject({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.end();
    });
};

async function test() {
    try {
        console.log('1. Logging in...');
        const loginData = await post('/api/hospital/login', {
            email: 'hospital@lifepulse.com',
            password: 'hospital123'
        });
        const token = loginData.token;
        console.log('Logged in. Token acquired.');

        console.log('2. Fetching donors...');
        const donorsData = await get('/api/hospital/donors', token);

        if (!donorsData.donors || donorsData.donors.length === 0) {
            console.log('No donors found. Cannot test alert.');
            return;
        }

        const donorId = donorsData.donors[0].id;
        console.log(`Sending alert to donor ID: ${donorId}`);

        console.log('3. Sending Alert...');
        const alertData = await post(`/api/hospital/alert-donor/${donorId}`, {}, token);
        console.log('Alert Response:', alertData);
        console.log('TEST PASSED ✅');

    } catch (error) {
        console.error('TEST FAILED ❌', error);
    }
}

test();
