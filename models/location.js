const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
    room: {
        type: String,
        required: [true, 'Room name is required'],
        unique: [true, 'This room already exists']
    },
    type: {
        type: String,
    },
    capacity: {
        type: Number,
    },
    staff_count: {
        type: Number,
        default: 0
    }
})

const Location = mongoose.model('location', LocationSchema);

module.exports = Location;
