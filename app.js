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
    res.render('signIn', { errorMessage: ''});
});

// to view sign up page
app.get('/signUp', (req, res) =>{
    res.render('signUp', { errorMessage: ''});
})

// send sign up datas to mongodb
app.post('/signUp', async (req, res) => {
    try {
        // Check if a user with the same name already exists
        const existingUser = await collection.findOne({ name: req.body.name });

        if (existingUser) {
            // If a user with the same name exists, render the 'signUp' template with an error message
            res.render('signUp', { errorMessage: 'Username already exists. Please choose a different username.' });
            return;
        }

        // If the username is unique, proceed with inserting the data into the database
        const data = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        }

        // Insert data into the database
        const userData = await collection.insertMany(data);

        // Retrieve the user object from the database
        const user = await collection.findOne({ name: req.body.name });

        // Render the 'home' template with the 'errorMessage' variable
        res.render('home', { username: req.body.name, useremail: req.body.email, user: user, errorMessage: '' });

    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Back to log in page
app.get('/logIn', (req, res) => {
    res.render('signIn', { errorMessage: '' });
});

// log In page datas sending to mongodb server
app.post('/logIn', async (req, res) => {
    try {
        // Check if the username exists
        const user = await collection.findOne({ name: req.body.name });
        if (user) {
            if (user.password === req.body.password) {
                res.render('home', { username: req.body.name, useremail: user.email, user: user, errorMessage: ''  });
            } else {
                res.render('signIn', { errorMessage: 'Password mismatch' });
            }
        } else {
            res.render('signIn', { errorMessage: 'Username does not exist' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
    }
});

// delete
app.get('/delete/:id', async (req, res) => {
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

// when click edit button redirect it to form page with prefilled data
app.get('/edit/:id' , async (req, res) => {
    const userId = req.params.id;
    console.log(userId)
    try {
        const user = await collection.findOne({ _id: userId });

        if (user) {
            res.render('editForm', { user, errorMessage: '' });
        } else {
            res.send('User not found');
        }
    } catch (error) {
        console.error('Error during edit:', error);
        res.status(500).send('Internal Server Error');
    }
})

// when cancel button click redirect it to welcome page
app.get('/welcome/:id', async (req, res) => {
    try {
        // Retrieve user data from the database based on the provided id
        const userId = req.params.id;
        const user = await collection.findOne({ _id: userId });

        // Check if the user was found
        if (user) {
            // Render the home.ejs page with the user data
            res.render('home', { username: user.name, useremail: user.email, user: user });
        } else {
            // Handle the case where the user with the provided id was not found
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error during fetching user data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})