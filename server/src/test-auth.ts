
import axios from 'axios';

const API_URL = 'http://localhost:4000/api/auth';

async function testAuth() {
  try {
    console.log('Testing Signup...');
    const signupRes = await axios.post(`${API_URL}/signup`, {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      role: 'CUSTOMER'
    });
    console.log('Signup successful:', signupRes.data);

    console.log('\nTesting Login...');
    const loginRes = await axios.post(`${API_URL}/login`, {
      email: signupRes.data.user.email,
      password: 'password123'
    });
    console.log('Login successful:', loginRes.data);

    console.log('\nTesting Custom ID Generation (Admin)...');
    const adminRes = await axios.post(`${API_URL}/signup`, {
      name: 'Admin User',
      email: `admin${Date.now()}@example.com`,
      password: 'password123',
      role: 'ADMIN'
    });
    console.log('Admin Signup successful:', adminRes.data);

  } catch (error: any) {
    console.error('Test failed:', error.response ? error.response.data : error.message);
  }
}

testAuth();
