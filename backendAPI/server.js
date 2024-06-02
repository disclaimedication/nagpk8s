const express = require('express');
const { Pool } = require('pg');

// require('dotenv').config(); //remove for k8s

const app = express();
app.use(express.json());
const port = process.env.PORT || 8080;

// This DBconfig is passed as ConfigMap and Secret values in K8s
const dbConfig = {
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
};

const pool = new Pool(dbConfig);

// Liveness Probe Endpoint(for K8s to know when the API pod is up)
app.get('/livez', (req, res) => {
    res.status(200).send('API is alive');
});

// Readiness Probe Endpoint (for K8s to know when the API pod is connected to DB)
app.get('/readyz', async (req, res) => {
    try {
        await pool.connect();
        res.status(200).send('API is ready');
    } catch (error) {
        console.error('Database connection error for readiness probe:', error);
        res.status(500).send('Database unavailable');
    }
});

// Main API endpoint for the retrieving teh students information  
app.get('/get/students', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM students');
        const data = result.rows;
        client.release();
        res.json(data);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Error retrieving data');
    }
});

// Sample endpoint added to pointout rolling update
app.get('/rollingupdate', (req, res) => {
    res.status(200).send('API has been updated to v1.4');
});

// API code to add students one by one
app.post('/add/student', async (req, res) => {
    const { name, age, grade } = req.body;
    try {
        const client = await pool.connect();
        const queryText = 'INSERT INTO students(name, age, grade) VALUES($1, $2, $3)';
        const result = await client.query(queryText, [name, age, grade]);
        client.release();
        res.status(201).send('Student added successfully');
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Failed to add student');
    }
});

// Main application to run the API
app.listen(port, () => {
    console.log(`API server listening on port ${port}`);
});
