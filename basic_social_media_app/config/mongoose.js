const mongoose = require('mongoose');
const debug = require('debug')('mongoose');

mongoose.connect('');

const db = mongoose.connection;

db.on('error', (err) => {
    debug(err);
});

db.once('open', () => {
    debug('MongoDB Connected');
});

module.exports = db;