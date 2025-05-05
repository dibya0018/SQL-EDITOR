import { NextResponse } from "next/server"
import sql from "mssql"

const config = {
  server: 'NEXON',
  database: 'tenders_db',
  user: 'dibya',
  password: 'pubg123',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  }
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      )
    }

    console.log("Attempting to connect to database...")
    const pool = await new sql.ConnectionPool(config).connect()
    
    console.log("Executing login query...")
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, password)
      .query('SELECT * FROM admin WHERE Email = @email AND Password = @password')

    console.log("Query result:", result.recordset)

    if (result.recordset.length > 0) {
      console.log("Login successful, updating last login time...")
      // Update last login time
      await pool.request()
        .input('email', sql.NVarChar, email)
        .query('UPDATE admin SET LastLogin = GETDATE() WHERE Email = @email')
      
      return NextResponse.json({ success: true })
    } else {
      console.log("Login failed: Invalid credentials")
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error("Detailed login error:", error)
    // Check if it's a database connection error
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { success: false, error: "Could not connect to database. Please check your database configuration." },
        { status: 500 }
      )
    }
    // Check if it's a table not found error
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return NextResponse.json(
        { success: false, error: "Database table not found. Please check your database setup." },
        { status: 500 }
      )
    }
    return NextResponse.json(
      { success: false, error: "An error occurred during login. Please try again later." },
      { status: 500 }
    )
  }
} 