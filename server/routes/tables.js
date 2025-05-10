const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');
const sql = require('mssql');

// Get all records from a table
router.get('/:tableName', async (req, res) => {
  const { tableName } = req.params;
  let pool;
  
  try {
    console.log(`[GET] Starting fetch operation for table ${tableName}`);
    
    // Get database connection
    pool = await getConnection();
    console.log('[GET] Database connection established');
    
    // Get table structure to identify date columns
    const tableInfo = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = '${tableName}'
    `);
    
    // Find date columns
    const dateColumns = tableInfo.recordset
      .filter(col => col.DATA_TYPE === 'date' || col.DATA_TYPE === 'datetime')
      .map(col => col.COLUMN_NAME);
    
    // Build the SELECT statement with CONVERT for date columns
    const selectColumns = tableInfo.recordset.map(col => {
      if (dateColumns.includes(col.COLUMN_NAME)) {
        return `CONVERT(varchar, ${col.COLUMN_NAME}, 23) as ${col.COLUMN_NAME}`;
      }
      return col.COLUMN_NAME;
    }).join(', ');
    
    // Execute query with formatted date columns
    const query = `SELECT ${selectColumns} FROM ${tableName} ORDER BY CreatedAt DESC`;
    console.log('[GET] Executing query:', query);
    
    const result = await pool.request().query(query);
    console.log('[GET] Query completed:', {
      recordCount: result.recordset.length,
      result: result
    });
    
    res.json(result.recordset);
  } catch (error) {
    console.error('[GET] Error details:', {
      message: error.message,
      code: error.code,
      state: error.state,
      stack: error.stack,
      originalError: error.originalError
    });
    
    res.status(500).json({ 
      error: `Failed to fetch ${tableName} data`,
      details: {
        message: error.message,
        code: error.code,
        state: error.state
      }
    });
  } finally {
    // Close the connection if it exists
    if (pool) {
      try {
        await pool.close();
        console.log('[GET] Database connection closed');
      } catch (closeError) {
        console.error('[GET] Error closing database connection:', closeError);
      }
    }
  }
});

// Get a single record by ID
router.get('/:tableName/:id', async (req, res) => {
  const { tableName, id } = req.params;
  let pool;
  
  try {
    console.log(`[GET] Starting fetch operation for record ${id} from table ${tableName}`);
    
    // Get database connection
    pool = await getConnection();
    console.log('[GET] Database connection established');
    
    // Execute query
    const query = `SELECT * FROM ${tableName} WHERE ${tableName}ID = @id`;
    console.log('[GET] Executing query:', query);
    
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query(query);
    
    console.log('[GET] Query completed:', {
      recordCount: result.recordset.length,
      result: result
    });
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('[GET] Error details:', {
      message: error.message,
      code: error.code,
      state: error.state,
      stack: error.stack,
      originalError: error.originalError
    });
    
    res.status(500).json({ 
      error: `Failed to fetch record from ${tableName}`,
      details: {
        message: error.message,
        code: error.code,
        state: error.state
      }
    });
  } finally {
    // Close the connection if it exists
    if (pool) {
      try {
        await pool.close();
        console.log('[GET] Database connection closed');
      } catch (closeError) {
        console.error('[GET] Error closing database connection:', closeError);
      }
    }
  }
});

// Create a new record
router.post('/:tableName', async (req, res) => {
  const { tableName } = req.params;
  let pool;
  
  try {
    console.log(`[POST] Creating new record in ${tableName}`);
    const data = req.body;
    console.log('Request data:', data);
    
    // Validate required fields based on table
    const requiredFields = {
      tenders: ['TenderName', 'TenderReferenceNo', 'StartDate', 'EndDate', 'DocumentPath'],
      results: ['Title', 'Department', 'ReferenceNo', 'ResultDate', 'DocumentPath']
    };
    
    const missingFields = requiredFields[tableName]?.filter(field => !data[field]);
    if (missingFields?.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: `The following fields are required: ${missingFields.join(', ')}`
      });
    }
    
    // Add default values
    data.CreatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    data.UpdatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    pool = await getConnection();
    console.log('[POST] Database connection established');
    
    // Get table structure
    const tableInfo = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = '${tableName}'
    `);
    
    // Create a map of valid columns
    const validColumns = tableInfo.recordset.map(col => col.COLUMN_NAME);
    
    // Filter out fields that don't exist in the table
    const filteredData = {};
    Object.keys(data).forEach(key => {
      if (validColumns.includes(key)) {
        filteredData[key] = data[key];
      }
    });
    
    const columns = Object.keys(filteredData).join(', ');
    const placeholders = Object.keys(filteredData).map(key => `@${key}`).join(', ');
    
    const request = pool.request();
    Object.keys(filteredData).forEach(key => {
      if (key.includes('Date') && key !== 'CreatedAt' && key !== 'UpdatedAt') {
        // Convert date string to SQL Server date format
        const dateValue = new Date(filteredData[key]);
        if (isNaN(dateValue.getTime())) {
          throw new Error(`Invalid date format for field ${key}`);
        }
        request.input(key, sql.Date, dateValue);
      } else if (key === 'CreatedAt' || key === 'UpdatedAt') {
        request.input(key, sql.DateTime, new Date(filteredData[key]));
      } else if (key === 'TenderID' || key === 'ResultID') {
        // Skip ID fields as they are auto-generated
        return;
      } else {
        request.input(key, sql.NVarChar(sql.MAX), filteredData[key]);
      }
    });
    
    console.log('[POST] Executing query with parameters:', {
      columns,
      placeholders,
      data: filteredData
    });
    
    const result = await request.query(`
      INSERT INTO ${tableName} (${columns})
      VALUES (${placeholders});
      SELECT SCOPE_IDENTITY() as ${tableName}ID;
    `);
    
    console.log('[POST] Insert result:', result);
    
    const newId = result.recordset[0][`${tableName}ID`];
    const newRecord = { ...filteredData, [`${tableName}ID`]: newId };
    
    res.status(201).json(newRecord);
  } catch (error) {
    console.error('[POST] Error details:', {
      message: error.message,
      code: error.code,
      state: error.state,
      stack: error.stack,
      originalError: error.originalError
    });
    
    res.status(500).json({ 
      error: `Failed to create record in ${tableName}`,
      details: error.message 
    });
  } finally {
    if (pool) {
      try {
        await pool.close();
        console.log('[POST] Database connection closed');
      } catch (closeError) {
        console.error('[POST] Error closing database connection:', closeError);
      }
    }
  }
});

// Update a record
router.put('/:tableName/:id', async (req, res) => {
  const { tableName, id } = req.params;
  let pool;
  
  try {
    console.log(`[PUT] Updating record in ${tableName} with ID ${id}`);
    const data = req.body;
    console.log('Request data:', data);
    
    // Update the UpdatedAt timestamp
    data.UpdatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    pool = await getConnection();
    console.log('[PUT] Database connection established');
    
    // Get the table structure
    const tableInfo = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = '${tableName}'
    `);
    
    // Create a map of valid columns and their data types
    const columnInfo = {};
    tableInfo.recordset.forEach(col => {
      columnInfo[col.COLUMN_NAME] = {
        type: col.DATA_TYPE,
        nullable: col.IS_NULLABLE === 'YES'
      };
    });
    
    // Filter out fields that don't exist in the table
    const validFields = Object.keys(data).filter(key => columnInfo[key]);
    
    const columns = validFields
      .filter(key => key !== `${tableName}ID`)
      .map(key => `${key} = @${key}`)
      .join(', ');
    
    const request = pool.request();
    validFields.forEach(key => {
      if (key === `${tableName}ID`) {
        // Skip ID as it's handled separately
        return;
      }
      
      const column = columnInfo[key];
      
      // Handle different data types based on the column type
      switch (column.type) {
        case 'int':
        case 'bigint':
          request.input(key, sql.Int, parseInt(data[key]));
          break;
        case 'date':
          const dateValue = new Date(data[key]);
          if (isNaN(dateValue.getTime())) {
            throw new Error(`Invalid date format for field ${key}`);
          }
          request.input(key, sql.Date, dateValue);
          break;
        case 'datetime':
          const datetimeValue = new Date(data[key]);
          if (isNaN(datetimeValue.getTime())) {
            throw new Error(`Invalid datetime format for field ${key}`);
          }
          request.input(key, sql.DateTime, datetimeValue);
          break;
        case 'nvarchar':
        case 'varchar':
          request.input(key, sql.NVarChar(sql.MAX), data[key]);
          break;
        case 'ntext':
        case 'text':
          request.input(key, sql.NVarChar(sql.MAX), data[key]);
          break;
        default:
          request.input(key, sql.NVarChar(sql.MAX), data[key]);
      }
    });
    
    request.input('id', sql.Int, parseInt(id));
    
    console.log('[PUT] Executing query with parameters:', {
      columns,
      data: validFields.reduce((acc, key) => {
        acc[key] = data[key];
        return acc;
      }, {})
    });
    
    await request.query(`
      UPDATE ${tableName}
      SET ${columns}
      WHERE ${tableName}ID = @id
    `);
    
    // Fetch the updated record
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query(`SELECT * FROM ${tableName} WHERE ${tableName}ID = @id`);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Record not found after update' });
    }
    
    console.log('[PUT] Update successful');
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('[PUT] Error details:', {
      message: error.message,
      code: error.code,
      state: error.state,
      stack: error.stack,
      originalError: error.originalError
    });
    
    res.status(500).json({ 
      error: `Failed to update record in ${tableName}`,
      details: error.message 
    });
  } finally {
    if (pool) {
      try {
        await pool.close();
        console.log('[PUT] Database connection closed');
      } catch (closeError) {
        console.error('[PUT] Error closing database connection:', closeError);
      }
    }
  }
});

// Delete a record
router.delete('/:tableName/:id', async (req, res) => {
  const { tableName, id } = req.params;
  console.log(`[DB DEBUG] Starting delete operation for table ${tableName} with ID ${id}`);

  let pool;
  try {
    pool = await getConnection();
    if (!pool) {
      throw new Error('Failed to establish database connection');
    }
    console.log('[DB DEBUG] Database connection established');

    // Get table structure first
    const tableInfoQuery = `
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = '${tableName}'
    `;
    console.log('[DB DEBUG] Getting table structure:', { query: tableInfoQuery });
    
    const tableInfo = await pool.request().query(tableInfoQuery);
    console.log('[DB DEBUG] Table structure:', {
      columns: tableInfo.recordset.map(col => ({
        name: col.COLUMN_NAME,
        type: col.DATA_TYPE
      }))
    });

    // Find the ID column
    const idColumn = tableInfo.recordset.find(col => 
      col.COLUMN_NAME.toLowerCase().includes('id')
    )?.COLUMN_NAME;

    if (!idColumn) {
      console.log('[DB DEBUG] No ID column found in table');
      return res.status(400).json({ error: 'No ID column found in table' });
    }

    console.log('[DB DEBUG] Using ID column:', { idColumn });

    // First check if the record exists
    const checkQuery = `SELECT ${idColumn} FROM ${tableName} WHERE ${idColumn} = @id`;
    console.log('[DB DEBUG] Checking record existence:', { query: checkQuery, id });
    
    const checkResult = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query(checkQuery);

    console.log('[DB DEBUG] Check result:', {
      recordCount: checkResult.recordset.length,
      result: checkResult.recordset
    });

    if (checkResult.recordset.length === 0) {
      console.log('[DB DEBUG] Record not found');
      return res.status(404).json({ error: 'Record not found' });
    }

    // Delete the record
    const deleteQuery = `DELETE FROM ${tableName} WHERE ${idColumn} = @id`;
    console.log('[DB DEBUG] Executing delete query:', { query: deleteQuery, id });
    
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query(deleteQuery);

    console.log('[DB DEBUG] Delete operation result:', {
      rowsAffected: result.rowsAffected,
      result: result
    });
    
    res.status(204).send();
  } catch (err) {
    console.error('[DB DEBUG] Error details:', {
      message: err.message,
      code: err.code,
      state: err.state,
      stack: err.stack,
      originalError: err.originalError
    });
    res.status(500).json({ 
      error: 'Failed to delete record',
      details: err.message 
    });
  } finally {
    if (pool) {
      try {
        await pool.close();
        console.log('[DB DEBUG] Database connection closed');
      } catch (closeError) {
        console.error('[DB DEBUG] Error closing database connection:', closeError);
      }
    }
  }
});

module.exports = router; 