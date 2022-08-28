const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DepartmentSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Faculty name is required.']
    },
    staff: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'course'
        }
    ],
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'faculty'
    },
    head: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
})

const Department = mongoose.model('department', DepartmentSchema);

module.exports = Department;
