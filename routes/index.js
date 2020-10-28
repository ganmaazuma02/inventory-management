const express = require('express')
const router = express.Router()

// @desc Home page
// @route GET /
router.get('/', (req, res) => {
    res.render('home')
})

// @desc Items page
// @route GET /items
router.get('/items', (req, res) => {
    res.render('items')
})

// @desc Login page
// @route GET /login
router.get('/login', (req, res) => {
    res.render('login')
})

module.exports = router