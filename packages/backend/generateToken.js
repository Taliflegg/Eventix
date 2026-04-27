const jwt = require('jsonwebtoken');

const JWT_SECRET = '1d9d6bafe1f54a7bb2a0c7cd0a3cf1f4b9fdd3fc84fa0e6d6b69e058c1f7a2a5';

function createToken(userId) {
  const token = jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  return token;
}

// דוגמה לשימוש:
//const userId = '04fc1787-e65f-43fc-bed9-4c6902d760ba'
const userId = '04fc1787-e65f-43fc-bed9-4c6902d760ba';

const token = createToken(userId);
console.log('JWT Token:', token);
