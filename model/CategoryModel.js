const mongoose = require('mongoose')

const categoryModelSchema = new mongoose.Schema({
    category_name: {
        type: String,
        required: true,
        trim : true
    }
},{timestamps:true})

// timestamps - createdAt, updatedAt
// _id - auto by mongoDB

module.exports = mongoose.model('Category',categoryModelSchema)