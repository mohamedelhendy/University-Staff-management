const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SlotSchema = new Schema({
    assigned_staff_id: {
        type: String
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course'
    },
    slot_day: {
        type: Number,
        enum: [0, 1, 2, 3, 4, 5, 6]
    },
    slot_number: {
        type: Number,
        enum: [1, 2, 3, 4, 5]
    },
    slot_type: {
        type: String,
        enum: ["Lecture", "Lab", "Tutorial"]
    }
})

const Slot = mongoose.model('slot', SlotSchema);

module.exports = Slot;
