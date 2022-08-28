const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SlotLinkingSchema = new Schema({
    requester_staff_id: {
        type: String,
        required: [true, 'Staff id is required.']
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected"],
        default: "Pending"
    },
    slot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'slot'
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course'
    }
})

const SlotLinking = mongoose.model('slot_linking', SlotLinkingSchema);

module.exports = SlotLinking;
