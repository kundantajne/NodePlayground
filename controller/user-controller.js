const poolPromise = require("../createDBConnection");
const sql = require('mssql');
const crypto = require('crypto')
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')

class User {
    constructor() { dotenv.config(); }

    createHash(password, salt = null) {
        // Creating a unique salt for a particular user
        this.salt = !!salt ? salt : crypto.randomBytes(16).toString('hex');

        // Hashing user's salt and password with 1000 iterations,
        //64 length and sha512 digest
        const hash = crypto.pbkdf2Sync(password, this.salt,
            1000, 64, `sha512`).toString(`hex`);
        return hash;
    }

    async generateToken(userUid) {
        try {
            const token = await jwt.sign({
                uid: userUid
            }, process.env.JWT_Key, { expiresIn: '0.00833333h' })
            return token;
        } catch (error) {
            console.error("Error while generating token:", error.message);
            throw error;
        }
    }

    async register(req) {
        let ps; // Declare PreparedStatement at the outer scope for cleanup
        try {
            const { FirstName, LastName, Password, DateOfBirth, Email } = req.body;

            // Input validation (basic example)
            if (!FirstName || !LastName || !Password || !DateOfBirth || !Email) {
                throw new Error('All fields are required');
            }

            // Get the shared connection pool
            const pool = await poolPromise;

            // Create a PreparedStatement tied to the pool
            ps = new sql.PreparedStatement(pool);
            ps.input('FirstName', sql.VarChar(50));
            ps.input('LastName', sql.VarChar(50));
            ps.input('Password', sql.NVarChar(sql.MAX));
            ps.input('DateOfBirth', sql.DateTimeOffset);
            ps.input('Email', sql.VarChar(50));
            ps.input('Salt', sql.NVarChar(sql.MAX));


            // Prepare and execute the SQL query
            await ps.prepare(`
                INSERT INTO user_details (FirstName, LastName, Password, DateOfBirth, Email,Salt)
                VALUES (@FirstName, @LastName, @Password, @DateOfBirth, @Email,@Salt)
            `);

            const salt = crypto.randomBytes(16).toString('hex');
            await ps.execute({
                FirstName: FirstName,
                LastName: LastName,
                Password: this.createHash(Password, salt),
                DateOfBirth: DateOfBirth,
                Email: Email,
                Salt: salt
            });

            console.log("User registered successfully");
        } catch (error) {
            console.error("Error registering user:", error.message);
            throw error;
        } finally {
            // Cleanup PreparedStatement
            if (ps) {
                await ps.unprepare().catch(err => console.error("Error unpreparing statement:", err.message));
            }
        }
    }

    async getUserDetails(email, password) {
        try {
            const pool = await poolPromise;
            const user = await pool.query(`select top 1 * from user_details where Email = '${email}'`);
            const userDetails = user.recordset[0];
            if (userDetails?.Email) {
                const passwordHash = this.createHash(password, userDetails.Salt);
                if(passwordHash === userDetails.Password){
                    const userToken = await this.generateToken(userDetails.uid);
                    return {token : userToken,userName:userDetails.FirstName};
                }else return 'Password or email is incorrect';
            } else {
                return 'Password or email is incorrect';
            }
        } catch (error) {
            console.error("Error while getting user:", error.message);
            throw error;
        }
    }

    async getAllEmployees() {
        try {
            const pool = await poolPromise;
            const user = await pool.query(`select * from Employee`);
            if (user?.recordset?.length) {
                return user.recordset;
            } else {
                return [];
            }
        } catch (error) {
            console.error("Error while getting user:", error.message);
            throw error;
        }
    }

}

const userInstance = new User();
module.exports = userInstance;
