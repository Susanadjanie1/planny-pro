// hash.js
import bcrypt from 'bcryptjs';

async function hashPassword() {
  const password = 'strongpassword123';
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log('Hashed password:', hashedPassword);
}

hashPassword();
