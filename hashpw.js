const bcrypt = require('bcryptjs');

// Ganti dengan password yang ingin di-hash
const password = 'admin123';

bcrypt.hash(password, 10).then(hash => {
  console.log('Hashed Password:', hash);
}).catch(err => {
  console.error('Error hashing password:', err);
});
