const mongoose = require('mongoose');
const debug = require('debug')('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/socialDB');

const db = mongoose.connection;

db.on('error', (err) => {
    debug(err);
});

db.once('open', () => {
    debug('MongoDB Connected');
});

module.exports = db;