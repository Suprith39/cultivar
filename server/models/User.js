const db = require('../db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

async function createUser({ name, email, password, role }) {
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await db.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role`,
    [name, email, hashed, role]
  );
  return result.rows[0];
}

async function findByEmail(email) {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}

module.exports = { createUser, findByEmail };
