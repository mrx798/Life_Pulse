const API_BASE = '/api/v1';
let token = localStorage.getItem('token');
let user = JSON.parse(localStorage.getItem('user'));

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const response = await fetch(`${API_BASE}/donor/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.requirePasswordReset) {
          document.getElementById('loginForm').style.display = 'none';
          document.getElementById('resetForm').style.display = 'block';
          localStorage.setItem('resetUser', JSON.stringify(data.donor));
        } else {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          window.location.href = '/donor/dashboard.html';
        }
      } else {
        alert(data.error);
      }
    });
  }

  const passwordResetForm = document.getElementById('passwordResetForm');
  if (passwordResetForm) {
    passwordResetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPassword = document.getElementById('newPassword').value;
      const resetUser = JSON.parse(localStorage.getItem('resetUser'));
      // Since not logged in, perhaps post to login with new password
      // For simplicity, assume update
      alert('Password reset not fully implemented');
    });
  }

  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = {
        full_name: document.getElementById('full_name').value,
        phone: document.getElementById('phone').value,
        area: document.getElementById('area').value,
        latitude: parseFloat(document.getElementById('latitude').value),
        longitude: parseFloat(document.getElementById('longitude').value),
        consent_given: document.getElementById('consent_given').checked,
      };
      const response = await fetch(`${API_BASE}/donor/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        alert('Profile updated');
      } else {
        alert('Error updating profile');
      }
    });
  }

  if (window.location.pathname === '/donor/dashboard.html') {
    loadProfile();
    loadRequests();
  }

  if (window.location.pathname === '/hospital/dashboard.html') {
    loadStats();
  }

  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const blood_group = document.getElementById('bloodGroup').value;
      const lat = document.getElementById('lat').value;
      const lon = document.getElementById('lon').value;
      const radius = document.getElementById('radius').value;
      const params = new URLSearchParams({ blood_group, lat, lon, radius });
      const response = await fetch(`${API_BASE}/hospital/donors?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      const results = document.getElementById('searchResults');
      results.innerHTML = data.donors.map(d => `<div>${d.full_name} - ${d.blood_group} - ${d.area}</div>`).join('');
    });
  }
});

async function loadProfile() {
  const response = await fetch(`${API_BASE}/donor/profile`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json();
  if (response.ok) {
    document.getElementById('full_name').value = data.donor.full_name;
    document.getElementById('phone').value = data.donor.phone;
    document.getElementById('area').value = data.donor.area;
    document.getElementById('latitude').value = data.donor.latitude;
    document.getElementById('longitude').value = data.donor.longitude;
    document.getElementById('consent_given').checked = data.donor.consent_given;
    document.getElementById('is_available').checked = data.donor.is_available;
  }
}

async function loadRequests() {
  const response = await fetch(`${API_BASE}/donor/requests`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json();
  if (response.ok) {
    const list = document.getElementById('requestsList');
    list.innerHTML = data.requests.map(r => `<div>${r.blood_group_needed} at ${r.latitude}, ${r.longitude} - <button onclick="respond(${r.id}, 'ACCEPTED')">Accept</button> <button onclick="respond(${r.id}, 'DECLINED')">Decline</button></div>`).join('');
  }
}

async function respond(requestId, response) {
  await fetch(`${API_BASE}/donor/respond`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ notification_id: requestId, response }),
  });
  loadRequests();
}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      document.getElementById('latitude').value = position.coords.latitude;
      document.getElementById('longitude').value = position.coords.longitude;
    });
  }
}

async function loadStats() {
  const donorsRes = await fetch(`${API_BASE}/hospital/donors`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const donors = await donorsRes.json();
  document.getElementById('totalDonors').textContent = donors.donors.length;
  document.getElementById('availableDonors').textContent = donors.donors.filter(d => d.is_available).length;
  const reqRes = await fetch(`${API_BASE}/hospital/requests`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const requests = await reqRes.json();
  document.getElementById('activeRequests').textContent = requests.requests.filter(r => r.status === 'active').length;
}

function createRequest() {
  // Simple prompt
  const blood = prompt('Blood group needed:');
  const lat = prompt('Latitude:');
  const lon = prompt('Longitude:');
  const radius = prompt('Radius km:', 5);
  fetch(`${API_BASE}/hospital/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ blood_group_needed: blood, latitude: parseFloat(lat), longitude: parseFloat(lon), radius_km: parseFloat(radius) }),
  }).then(() => loadStats());
}

function logout() {
  localStorage.clear();
  window.location.href = '/donor/login.html';
}