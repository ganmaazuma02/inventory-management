const mongoose = require('mongoose')

const ItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    dateTimeAdded: {
        type: Date,
        required: true
    }
})

module.exports = mongoose.model('Item', ItemSchema)