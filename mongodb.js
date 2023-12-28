const mongoose = require('mongoose');

const connect = mongoose.connect('mongodb://localhost:27017/logInPage');

connect.then(() => {
    console.log('Database connected succesfully')
})
.catch(() => {
    console.log('Database cannot be connected');
});

// creating schema
const logInSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

const collection = new mongoose.model('users', logInSchema);

module.exports = collection;