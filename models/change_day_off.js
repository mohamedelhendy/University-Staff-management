const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChangeDayOffSchema = new Schema({
    staff_id: {
        type: String,
        required: [true, 'Staff id is required.']
    },
    new_day_off: {
        type: Number,
        enum: [0, 1, 2, 3, 4, 5, 6],
        required: [true, 'Leave day is required.']
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected"],
        default: "Pending"
    },
    change_reason: {
        type: String
    },
    response_reason: {
        type: String
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'department'
    }
})

const ChangeDayOff = mongoose.model('change_day_off', ChangeDayOffSchema);

module.exports = ChangeDayOff;
