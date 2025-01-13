const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')

dotenv.config();
async function verifyJwt(req, res, next){
    try {
        const token =req.header('Authorization')
        jwt.verify(token,process.env.JWT_Key,(err,decoded)=>{
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).send('Token Expired. Please log in again.');
                }
                return res.status(403).send('Invalid Token');
            }
            req.user = decoded ;
        })
    } catch (error) {
        
    }
}

module.exports = verifyJwt;