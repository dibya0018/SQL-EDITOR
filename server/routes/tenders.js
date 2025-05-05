const express = require('express');
const router = express.Router();
const { getConnection } = require('../config/db');
const sql = require('mssql');

// Get all tenders
router.get('/', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT 
        TenderID,
        TenderName,
        TenderReferenceNo,
        CONVERT(varchar, StartDate, 23) as StartDate,
        CONVERT(varchar, EndDate, 23) as EndDate,
        DocumentPath,
        CorrigendumPath,
        CreatedAt,
        UpdatedAt
      FROM tenders
      ORDER BY CreatedAt DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching tenders:', error);
    res.status(500).json({ error: 'Failed to fetch tenders' });
  }
});

// Get a single tender by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT 
          TenderID,
          TenderName,
          TenderReferenceNo,
          CONVERT(varchar, StartDate, 23) as StartDate,
          CONVERT(varchar, EndDate, 23) as EndDate,
          DocumentPath,
          CorrigendumPath,
          CreatedAt,
          UpdatedAt
        FROM tenders
        WHERE TenderID = @id
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Tender not found' });
    }
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error fetching tender:', error);
    res.status(500).json({ error: 'Failed to fetch tender' });
  }
});

// Create a new tender
router.post('/', async (req, res) => {
  try {
    const { TenderName, TenderReferenceNo, StartDate, EndDate, DocumentPath, CorrigendumPath } = req.body;
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('TenderName', sql.NVarChar, TenderName)
      .input('TenderReferenceNo', sql.NVarChar, TenderReferenceNo)
      .input('StartDate', sql.Date, StartDate)
      .input('EndDate', sql.Date, EndDate)
      .input('DocumentPath', sql.NVarChar, DocumentPath)
      .input('CorrigendumPath', sql.NVarChar, CorrigendumPath)
      .query(`
        INSERT INTO tenders (
          TenderName,
          TenderReferenceNo,
          StartDate,
          EndDate,
          DocumentPath,
          CorrigendumPath,
          CreatedAt,
          UpdatedAt
        )
        VALUES (
          @TenderName,
          @TenderReferenceNo,
          @StartDate,
          @EndDate,
          @DocumentPath,
          @CorrigendumPath,
          GETDATE(),
          GETDATE()
        );
        SELECT SCOPE_IDENTITY() as TenderID;
      `);
    
    res.status(201).json({
      TenderID: result.recordset[0].TenderID,
      message: 'Tender created successfully'
    });
  } catch (error) {
    console.error('Error creating tender:', error);
    res.status(500).json({ error: 'Failed to create tender' });
  }
});

// Update a tender
router.put('/:id', async (req, res) => {
  try {
    const { TenderName, TenderReferenceNo, StartDate, EndDate, DocumentPath, CorrigendumPath } = req.body;
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('TenderID', sql.Int, req.params.id)
      .input('TenderName', sql.NVarChar, TenderName)
      .input('TenderReferenceNo', sql.NVarChar, TenderReferenceNo)
      .input('StartDate', sql.Date, StartDate)
      .input('EndDate', sql.Date, EndDate)
      .input('DocumentPath', sql.NVarChar, DocumentPath)
      .input('CorrigendumPath', sql.NVarChar, CorrigendumPath)
      .query(`
        UPDATE tenders
        SET 
          TenderName = @TenderName,
          TenderReferenceNo = @TenderReferenceNo,
          StartDate = @StartDate,
          EndDate = @EndDate,
          DocumentPath = @DocumentPath,
          CorrigendumPath = @CorrigendumPath,
          UpdatedAt = GETDATE()
        WHERE TenderID = @TenderID;
        
        IF @@ROWCOUNT = 0
          THROW 50000, 'Tender not found', 1;
      `);
    
    res.json({ message: 'Tender updated successfully' });
  } catch (error) {
    console.error('Error updating tender:', error);
    if (error.message.includes('Tender not found')) {
      res.status(404).json({ error: 'Tender not found' });
    } else {
      res.status(500).json({ error: 'Failed to update tender' });
    }
  }
});

// Delete a tender
router.delete('/:id', async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('TenderID', sql.Int, req.params.id)
      .query(`
        DELETE FROM tenders
        WHERE TenderID = @TenderID;
        
        IF @@ROWCOUNT = 0
          THROW 50000, 'Tender not found', 1;
      `);
    
    res.json({ message: 'Tender deleted successfully' });
  } catch (error) {
    console.error('Error deleting tender:', error);
    if (error.message.includes('Tender not found')) {
      res.status(404).json({ error: 'Tender not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete tender' });
    }
  }
});

module.exports = router; 