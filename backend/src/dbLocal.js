import mysql from "mysql2/promise";

// Pool de ligações MySQL para desenvolvimento local
const dbLocal = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'clickup_db',
  waitForConnections: true,
  connectionLimit: 10, // Máximo de ligações simultâneas
  queueLimit: 0
});

// Valida a ligação ao iniciar o módulo
try {
  const connection = await dbLocal.getConnection();
  await connection.query('SELECT 1');
  connection.release();
  console.log('✅ MySQL Local DB Connected');
} catch (error) {
  console.error('❌ MySQL Local DB Connection Failed:', error.message);
  throw error;
}

export { dbLocal as db };
export const isPostgres = false; // Sinaliza modo MySQL