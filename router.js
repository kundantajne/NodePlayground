const express = require("express");
const poolPromise = require("./createDBConnection");
const userInstance = require("./controller/user-controller");
const verifyJwt = require('./middlewere/jwt-token-middlewere');

const router = express.Router();
router.use('/api',verifyJwt);

router.get('/', async (req, res, next) => {
    const pool = await poolPromise;
    const emp = await pool.query('select * from Employee');
    res.send(emp.recordset);
})

router.post('/register_user', async (req, res, next) => {
    try {
        await userInstance.register(req);
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Error registering user:", error.message);
        throw error;
    }
})

router.get('/login', async (req, res, next) => {
    try {
        const user = await userInstance.getUserDetails(req.query['Email'], req.query['Password'].trim());
        res.send(user);
    } catch (error) {

    }
})

router.get('/api/get_all_employees', async (req, res, next) => {
    try {
        const user = await userInstance.getAllEmployees();
        res.send(user);
    } catch (error) {

    }
})

module.exports = router;