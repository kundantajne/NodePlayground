const sql = require('mssql');
const dotenv = require('dotenv')

dotenv.config();
const sqlConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    options:{
        encrypt: false,
        enableArithAbort: true
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    }
};

const poolPromise = new sql.ConnectionPool(sqlConfig).connect().then(pool => {
    console.log("conneted to database")
    return pool;
}).catch((error)=>{
    console.log(error);
});

module.exports = poolPromise;