const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Faculty name is required.']
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'department'
    },
    instructors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    teaching_assistants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    coordinator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
})

const Course = mongoose.model('course', CourseSchema);

module.exports = Course;
