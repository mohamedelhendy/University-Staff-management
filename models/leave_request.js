const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LeaveRequestSchema = new Schema({
    staff_id: {
        type: String,
        required: [true, 'Staff id is required.']
    },
    leave_day: {
        type: Date,
        required: [true, 'Leave day is required.']
    },
    leave_type: {
        type: String,
        enum: ["Annual", "Accidental", "Sick", "Maternity", "Compensation"]
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected"],
        default: "Pending"
    },
    leave_reason: {
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

const LeaveRequest = mongoose.model('leave_request', LeaveRequestSchema);

module.exports = LeaveRequest;
