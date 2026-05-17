const SUPABASE_URL = 'https://tuozemcmikaxdxxdorzk.supabase.co/rest/v1/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1b3plbWNtaWtheGR4eGRvcnprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NzY2NzAsImV4cCI6MjA5NDU1MjY3MH0.MY04aQQIxrVzYBGLVs0vTanJ6sIr3KPRljYqhR_yxg8';

const API_URL = ${SUPABASE_URL}/rest/v1/licenses;

async function loadKeys() {
  const res = await fetch(${API_URL}?select=*, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: Bearer ${SUPABASE_ANON_KEY}
    }
  });

  const data = await res.json();
  const table = document.getElementById('keysTable');

  table.innerHTML = '';

  data.forEach(item => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${item.license_key}</td>
      <td>${item.device_id || 'не привязан'}</td>
      <td>${item.status}</td>
      <td>
        <button onclick="banKey('${item.license_key}')">Бан</button>
        <button onclick="unbanKey('${item.license_key}')">Разбан</button>
        <button onclick="resetDevice('${item.license_key}')">Сбросить ПК</button>
      </td>
    `;

    table.appendChild(row);
  });
}

async function addKey() {
  const key = document.getElementById('keyInput').value.trim();

  if (!key) {
    alert('Введите ключ');
    return;
  }

  await fetch(API_URL, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: Bearer ${SUPABASE_ANON_KEY},
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      license_key: key,
      device_id: null,
      status: 'active'
    })
  });

  document.getElementById('keyInput').value = '';
  loadKeys();
}

async function banKey(key) {
  await updateKey(key, { status: 'banned' });
}

async function unbanKey(key) {
  await updateKey(key, { status: 'active' });
}

async function resetDevice(key) {
  await updateKey(key, { device_id: null });
}

async function updateKey(key, data) {
  await fetch(${API_URL}?license_key=eq.${key}, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: Bearer ${SUPABASE_ANON_KEY},
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  loadKeys();
}

loadKeys();