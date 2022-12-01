const express = require('express')
require('dotenv').config()
require('./database/connection')
const port = process.env.PORT


// middleware
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const cookieParser = require('cookie-parser')


// routes
const CategoryRoute = require('./route/categoryRoute')
const ProductRoute = require('./route/productRoute')
const UserRoute = require('./route/UserRoute')
const OrderRoute = require('./route/orderRoute')

const app = express()

// middleware
app.use(bodyParser.json())
app.use(morgan('dev'))
app.use(cors())
app.use(cookieParser())

// routes
app.use('/api',CategoryRoute)
app.use('/api',ProductRoute)
app.use('/api',UserRoute)
app.use('/api', OrderRoute)
app.use('/public/uploads', express.static('public/uploads'))


// to access app/api from browser
app.listen(port, ()=>{
    console.log(`Server started at port ${port}`)
})



// app.get(path, function) ->
// path -> url
// function -> what to do
// function(request, response)
// request -> data from user to server
// response -> data to user from server


















// app.get('/first', (req,res)=>{
//     res.send("HELLO WORLD")
// })





// console.log(port)
// console.log("hello world")
// console.log("hello world")



// // const date = Date.now()
// const date = new Date()
// console.log(date)

// /* difference between node js and vanilla js
// - node runs on server, vanilla js on browser
// - node is for backend
// - console is terminal window

// */

// const os= require('os')
// const path = require('path')
// const fs = require('fs')
// const crypto = require('crypto')

// const { dirname } = require('path')
// const { add, add2 } = require('./server')
// // const add = require('./server')

// let ans = add(2,3)
// console.log(ans)

// ans = add2(5,10)
// console.log(ans)

// console.log(os.type())
// console.log(os.version())
// console.log(os.homedir())
// console.log(os.hostname())

// console.log(__dirname)
// console.log(__filename)