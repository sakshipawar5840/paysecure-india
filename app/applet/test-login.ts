import axios from 'axios';

async function test() {
  try {
    const res = await axios.post('http://127.0.0.1:3000/api/auth/login', {
      email: 'john@example.com',
      password: 'password'
    });
    console.log("Success:", res.data);
  } catch (err: any) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
test();
