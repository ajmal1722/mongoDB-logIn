const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const collection = require('./mongodb');

const app = express();

dotenv.config({path : 'config.env'})  // file path
const PORT = process.env.PORT || 8080;

// log requests
app.use(morgan('tiny'));

// convert data into json format
app.use(express.json())
app.use(express.urlencoded({extended:false}));

// set view engine
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('signIn');
});

// sign up page
app.get('/signUp', (req, res) =>{
    res.render('signUp');
})

// send sign up datas to mongodb
app.post('/signUp', async (req, res) => {
    const data = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    }

    const userData = await collection.insertMany(data);
    console.log(userData)
    res.send('sign up completed');
}) 

// Back to log in page
app.get('/logIn', (req, res) => {
    res.render('signIn')
})
// log In page datas sending to mongodb server
app.post('/logIn', (req, res) => {
    // console.log(req.body)
    res.send('heloo')
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})