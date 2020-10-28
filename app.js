const path = require('path')
const express = require('express')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const morgan = require('morgan')
const exphbs = require('express-handlebars')
const helmet = require('helmet')
const compression = require('compression')
const items = require('./routes/api/items')

// Load config
dotenv.config({ path: './config/config.env' })

connectDB()

const app = express()
app.use(express.json());
app.use(helmet())
app.use(compression())

if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Handlebars
app.engine('.hbs', exphbs({
    extname: '.hbs', 
    defaultLayout: "shared", 
    helpers: {
        section: function(name, options){ 
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this); 
            return null;
        } 
    }
}))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.hbs')

// Static folder
app.use(express.static(path.join(__dirname, 'public')))

// Routes
app.use('/', require('./routes/index'))
app.use('/api/items', items)

const PORT = process.env.PORT || 3000

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`))