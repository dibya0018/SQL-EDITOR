import mysql from "mysql2/promise"

// Database configuration using environment variables
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "tenders",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}

// Create a connection pool
let pool: mysql.Pool

export async function getConnection() {
  try {
    if (pool) {
      return pool
    }

    pool = mysql.createPool(dbConfig)
    console.log("Database connection pool created successfully")
    return pool
  } catch (err) {
    console.error("Error creating database connection:", err)
    throw err
  }
}

export async function executeQuery(query: string, params?: any[]) {
  try {
    const pool = await getConnection()
    const request = pool.getConnection()

    if (params) {
      params.forEach((param, index) => {
        request.input(`param${index}`, param)
      })
    }

    const result = await request.execute(query)
    return result.recordset
  } catch (err) {
    console.error("Error executing query:", err)
    throw err
  }
}
