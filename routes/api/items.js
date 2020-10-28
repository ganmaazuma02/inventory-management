const Item = require('../../models/Item')
const express = require('express')
const router = express.Router()
const Joi = require('joi')
const multer  = require('multer')
const upload = multer({ dest: 'public/uploads/' })
const fs = require('fs');
const moment = require('moment')

const postItemSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
    quantity: Joi.number().integer().required(),
    imageUrl: Joi.string()
})

router.get('/', async (req, res) => {
    const items = await Item.find().sort('name')
    res.send(items)
})

router.get('/:id', async (req, res) => {
    const item = await Item.findById(req.params.id)
    if(!item) {
        return res.status(404).send('Item not found')
    }
    res.status(200).send(item)
})

router.post('/', async (req, res) => {
    const validate = postItemSchema.validate(req.body)
    if(!validate.error) {
        let newItem = new Item({
           name: req.body.name,
           description: req.body.description,
           quantity: req.body.quantity,
           imageUrl: req.body.imageUrl,
           dateTimeAdded: new Date() 
        })
        newItem = await newItem.save()
        res.send(newItem)
    } else {
        return res.status(400).send(validate.error.details[0].message)
    }
})

router.post('/image', upload.single('item'), function (req, res, next) {
    let tmp_path = req.file.path;
    let currentDateTime = moment(new Date()).format('DDMMMYYYY_HHmmss');
    let target_path = 'public/uploads/' + currentDateTime + req.file.originalname;
    let src = fs.createReadStream(tmp_path);
    let dest = fs.createWriteStream(target_path);
    src.pipe(dest);
    src.on('end', function() { return res.send('uploads/' + currentDateTime + req.file.originalname) })
    src.on('error', function(err) { return res.status(400).send('error') })
})

router.get('/image/delete', (req, res) => {
    let imageName = req.query.imageName
    let path = 'public/' + imageName
    fs.unlink(path, (err) => {
        if (err) {
          console.error(err)
          return res.status(400).send('error deleting image')
        }
        //iamge removed
        return res.status(200).send('image deleted successfully')
      })
})

router.put('/:id', async (req, res) => {
    const validate = postItemSchema.validate(req.body)
    if(!validate.error) {
        let item = await Item.findById(req.params.id);
        if(item.imageUrl !== req.body.imageUrl) {
            // delete old image
            fs.unlink('public/' + item.imageUrl, (err) => {
                if (err) {
                  console.error(err)
                }
                //image removed
                console.log('old image removed')
              })
        }
        item.name = req.body.name
        item.description = req.body.description
        item.quantity = req.body.quantity
        item.imageUrl = req.body.imageUrl
        item = await item.save()
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