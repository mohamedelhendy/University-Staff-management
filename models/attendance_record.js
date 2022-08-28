const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AttendanceRecordSchema = new Schema({
    staff_id: {
        type: String,
        required: [true, 'Staff id is required']
    },
    sign_in: {
        type: Date,
        required: [true, 'Sign in time is required']
    },
    sign_in_month: {
        type: Number
    },
    sign_in_day: {
        type: Number
    },
    sign_out: {
        type: Date
    }
})

AttendanceRecordSchema.virtual('month').get(function() {
    console.log({$month: this.sign_in});
    return {$month: this.sign_in};
});


const attendance_record = mongoose.model('attendance_record', AttendanceRecordSchema);

module.exports = attendance_record;