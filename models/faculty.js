const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FacultySchema = new Schema({
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
    departments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'department'
        }
    ],
})

const Faculty = mongoose.model('faculty', FacultySchema);

module.exports = Faculty;
