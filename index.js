const express = require('express')
const router = require('./router');



// const http = require('http')
// http.createServer(function(req,res){
//     // switch(req.url){
//     //     case "/":
//     //         res.end('Hello!!!!!!!');
//     //         break;
//     // }
// }).listen(1208,'localhost',()=>{
//     console.log('Welcome to my server');
// });


const app = express()
const port = 1208

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.message);
    res.status(err.status || 500).json({
        error: "Something went wrong",
        details: err.message,
    });
});



app.listen(port, () => {
    console.log("Server listing on 1208")
})

