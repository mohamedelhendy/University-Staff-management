const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const  jwt  =  require('jsonwebtoken');
const  bcrypt  =  require('bcryptjs');
const SECRET_KEY = "guc_staff_secret_key";

var moment = require('moment');
const Record = require('../models/attendance_record');
const autoIncrementID = require('./counter');
const options = {discriminatorKey: 'kind', timestamps: true};

const UserSchema = new Schema({
    staff_id: {
        type: String,
    },
    email: {
        type: String,
        required: [true, 'email is required'],
        unique: [true, 'This email is already registered']
    },
    password: {
        type: String,
        required: [true, 'password is required']
    },
    name: {
        type: String,
        required: [true, 'name is required']
    },
    salary: {
        type: Number,
        required: [true, 'salary is required']
    },
    office_location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'location',
        // required: [true, 'office location is required']
    },
    staff_type: {
        type: String,
        enum: ['hr', 'hod', 'ci', 'cc', 'am']
    },
    day_off: {
        type: Number,
        enum: [0, 1, 2, 3, 4, 5, 6]
        // 0:Sun ------ 6: Sat
    },
    leave_days: {
        type: Number,
        default: 0
    }
}, options)

UserSchema.pre('save', function(next) {
    var doc = this;
    if (!this.isNew) {
        next();
        return;
    }

    if (doc.staff_type === 'hr'){
        autoIncrementID('hr', this, next);
    } else {
        autoIncrementID('ac', this, next);
    }
});

UserSchema.methods.generate_token = function() {
    const department = this.department? this.department : '';
    const office = this.office? this.office : '';
    const  expiresIn  =  24  *  60  *  60;
    const  accessToken  =  jwt.sign({
        id:  this._id,
        staff_id:  this.staff_id,
        email: this.email,
        password: this.password,
        name: this.name,
        salary: this.salary,
        office: this.office_location,
        department: department,
        office: office,
        type: this.staff_type,
        days_off: this.days_off,
        records: this.records,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    }, SECRET_KEY, {
        expiresIn:  expiresIn
    });
    return accessToken;
};

const User = mongoose.model('user', UserSchema);

const ACUserSchema = new Schema({
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course'
    }],
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'department'
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'faculty'
    }
})

const ACUser = User.discriminator('ac_user', ACUserSchema, options)

const HRUserSchema = new Schema({
    
})

const HRUser = User.discriminator('hr_user', HRUserSchema, options)


module.exports = {
    'user': User,
    'ac_user': ACUser,
    'hr_user': HRUser
};
