const Item = require('../../models/Item')
const express = require('express')
const router = express.Router()
const Joi = require('joi')

const postItemSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    quantity: Joi.number().integer().required()
})

router.get('/', async (req, res) => {
    const items = await Item.find().sort('name')
    res.send(items)
})

router.post('/', async (req, res) => {
    const validate = postItemSchema.validate(req.body)
    if(!validate.error) {
        let newItem = new Item({
           name: req.body.name,
           description: req.body.description,
           quantity: req.body.quantity,
           dateTimeAdded: new Date() 
        })
        newItem = await newItem.save()
        res.send(newItem)
    } else {
        return res.status(400).send(validate.error.details[0].message)
    }
})

router.put('/:id', async (req, res) => {
    const validate = postItemSchema.validate(req.body)
    if(!validate.error) {
        const item = await Item.findByIdAndUpdate(req.params.id, { 
            name: req.body.name, 
            description: req.body.description,
            quantity: req.body.quantity
        },{ new: true})
        if(!item) return res.status(404).send('The item with the given ID cannot be found')
        res.send(item)
    } else {
        return res.status(400).send(validate.error.details[0].message)
    }
})

router.delete('/:id', async (req, res) => {
    const item = await Item.findByIdAndRemove(req.params.id)
    if(!item) return res.status(404).send('The item with the given ID cannot be found')
    res.send(item)
})

module.exports = router