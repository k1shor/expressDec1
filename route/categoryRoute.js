const express = require('express')
const { postCategory, getAllCategories, getCategory, updateCategory, deleteCategory } = require('../controller/categoryController')
const { requireSignin } = require('../controller/userController')
const { categoryValidationRules, validate } = require('../validation')
const router = express.Router()

router.post('/addcategory',categoryValidationRules, validate,requireSignin,postCategory)
router.get('/getallcategories', getAllCategories)
router.get('/categorydetails/:id',getCategory)
router.put('/updatecategory/:id', requireSignin, updateCategory)
router.delete('/deletecategory/:id', requireSignin, deleteCategory)

module.exports = router