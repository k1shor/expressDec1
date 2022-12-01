const Token = require('../model/TokenModel')
const User = require('../model/UserModel')
const crypto = require('crypto')
const sendEmail = require('../utils/sendEmail')
const jwt = require('jsonwebtoken')
const {expressjwt} = require('express-jwt')

// register
exports.addUser = async(req, res) => {
    // check email if already exists
    let user = await User.findOne({email: req.body.email})
    if(user){
        return res.status(400).json({error: "Email already exists. Please login or try different email."})
    }
    // create user
    let userToAdd = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    })
    // generate token
    let token = new Token({
        token: crypto.randomBytes(24).toString('hex'),
        user: userToAdd._id
    })
    token = await token.save()
    if(!token){
        return res.status(400).json({error:"Something went wrong"})
    }
    // send token in email
    const url = `http://localhost:5000/api/confirm/${token.token}`
    sendEmail({
        from: "noreply@example.com",
        to: req.body.email,
        subject: "Verification Email",
        text: "Click on the following link to activate your account." + url,
        html: `<a href='${url}'><button>Verify Email</button></a>`
    })
    // add user
    userToAdd = await userToAdd.save()
    if(!userToAdd){
        return res.status(400).json({error: "Something went wrong"})
    }
    res.send(userToAdd)
}

// resend verification link
exports.resendVerification = async (req, res) => {
    // check email
    let user = await User.findOne({email:req.body.email})
    if(!user){
        return res.status(400).json({error:"Email not registered."})
    }
    // check if already verified
    if(user.isVerified){
        return res.status(400).json({error: "User already verified. Login to continue."})
    }
    // generate token
    let token = new Token({
        user: user._id,
        token: crypto.randomBytes(24).toString('hex')
    })
    token = await token.save()
    if(!token){
        return res.status(400).json({error:"Something went wrong"})
    }
    // send in email
    const url = `http://localhost:5000/api/confirm/${token.token}`
    sendEmail({
        from: "noreply@example.com",
        to: req.body.email,
        subject: "Verification Email",
        text: "Click on the following link to activate your account." + url,
        html: `<a href='${url}'><button>Verify Email</button></a>`
    })
    return res.status(200).json({message: "Verification link has been sent to your email."})

}

// email verification
exports.verifyEmail = async(req, res) => {
    // check token
    const token = await Token.findOne({token: req.params.token})
    if(!token){
        return res.status(400).json({error:"Invalid token or may have expired."})
    }
    // check user
    let user = await User.findById(token.user)
    if(!user){
        return res.status(400).json({error:"User not found."})
    }
    // check if already verified
    if(user.isVerified){
        return res.status(400).json({error:"User already verified. Login to continue."})
    }
    // verify user
    user.isVerified = true
    user = await user.save()
    if(!user){
        return res.status(400).json({error: "Something went wrong"})
    }
    return res.status(200).json({message:"User verified Successfully. Login to continue."})
}

// forget password
exports.forgetpassword= async(req, res) => {
    // check email
    let user = await User.findOne({email:req.body.email})
    if(!user){
        return res.status(400).json({error:"Email not registered."})
    }
    // generate token
    let token = new Token({
        token: crypto.randomBytes(24).toString('hex'),
        user: user._id
    })
    token = await token.save()
    if(!token){
        return res.status(400).json({error:"Something went wrong"})
    }
    // send token in email
    const url = `http://localhost:5000/api/resetpassword/${token.token}`
    sendEmail({
        from: "noreply@example.com",
        to: req.body.email,
        subject: "Reset Password",
        text: "Click on the following link to reset your password." + url,
        html: `<a href='${url}'><button>Reset Password</button></a>`
    })
    return res.status(200).json({message:"Password reset link has been sent to your email."})
}

// reset password
exports.resetPassword = async (req, res) => {
    // check token
    let token = await Token.findOne({token: req.params.token})
    if(!token){
        return res.status(400).json({error:"Invalid token or token may have expired"})
    }
    // find user
    let user = await User.findById(token.user)
    if(!user){
        return res.status(400).json({error:"User not found."})
    }
    // change password
    user.password = req.body.password
    // save user
    user = await user.save()
    if(!user){
        return res.status(400).json({error:"Something went wrong"})
    }
    return res.status(200).json({message:"Password changed successfully"})
}

// signin process
exports.signin = async (req,res) => {
    // destructuring user inputs
    const {email, password} = req.body
    // check email
    let user = await User.findOne({email: email})
    if(!user){
        return res.status(400).json({error:"User not registered."})
    }
    // check password
    if(!user.authenticate(password)){
        return res.status(400).json({error:"Email and password do not match."})
    }
    // check if verified or not
    if(!user.isVerified){
        return res.status(400).json({error:"User not verified. Verify to continue"})
    }
    // create login token
    const token = jwt.sign({user: user._id, role: user.role},process.env.JWT_SECRET)
    // set cookies
    res.cookie('myCookie',token,{expire: Date.now()+86400})
    // return information to user
    const {_id, username, role} = user
    return res.status(200).json({token, user: {_id, username, email, role}})
}

// signout process
exports.signout = async (req,res) => {
    let response = await res.clearCookie('myCookie')
    if(!response){
        return res.status(400).json({error:"Something went wrong"})
    }
    res.status(200).json({message:"Logout successful"})

}

// authorization
exports.requireSignin = expressjwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256']
})

// find user by email
exports.findUserByEmail = async (req, res) => {
    let user = await User.findOne({email:req.body.email})
    if(!user){
        res.status(400).json({error:"User not found"})
    }
    res.send(user)
}

// find user details
exports.findUser = async(req, res) => {
    let user = await User.findById(req.params.id)
    if(!user){
        res.status(400).json({error:"User not found"})
    }
    res.send(user)
}

// to get users list
exports.userList = async (req, res) => {
    let users = await User.find()
    if(!users){
        res.status(400).json({error:"Something went wrong"})
    }
    res.send(users)
}