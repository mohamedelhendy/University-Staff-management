const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReplacementRequestSchema = new Schema({
    requester_staff_id: {
        type: String,
        required: [true, 'Staff id is required.']
    },
    receiver_staff_id: {
        type: String,
        required: [true, 'Receiver Staff id is required.']
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected"],
        default: "Pending"
    },
    slot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'slot'
    }
})

const ReplacementRequest = mongoose.model('replacement_request', ReplacementRequestSchema);

module.exports = ReplacementRequest;
