const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const collection = require('./mongodb');
const methodOverride = require('method-override');

const app = express();

dotenv.config({path : 'config.env'})  // file path
const PORT = process.env.PORT || 8080;

// log requests
app.use(morgan('tiny'));

// parse request to body-parser
app.use(bodyParser.urlencoded({extended:true}));

app.use(methodOverride('_method'));

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

     // Insert data into the database
     const userData = await collection.insertMany(data);

     // Retrieve the user object from the database (you may need to adjust this based on your actual data structure)
     const user = await collection.findOne({ name: req.body.name });

     // Pass the 'user' object to the 'home' template
     res.render('home', { username: req.body.name, useremail: req.body.email, user: user });
}) 

// Back to log in page
app.get('/logIn', (req, res) => {
    res.render('signIn')
})

// log In page datas sending to mongodb server
app.post('/logIn', async (req, res) => {
    try {
        // Check if the username exists
        const user = await collection.findOne({ name: req.body.name });
        if (user) {
            if (user.password === req.body.password) {
                res.render('home', { username: req.body.name, useremail: user.email, user: user });
            } else {
                res.send('password mismatch')
            }        
        } else {
            res.send('user name does not exist')
        }   
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
});

// delete
app.delete('/delete/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Use deleteOne to delete a document based on its ID
        const result = await collection.deleteOne({ _id: userId });

        // Check if the deletion was successful
        if (result.deletedCount === 1) {
            res.redirect('/logIn');
        } else {
            res.send('User not found or could not be deleted');
        }
    } catch (error) {
        console.error('Error during user deletion:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})