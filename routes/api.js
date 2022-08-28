const express = require ('express');
var moment = require('moment');
const router = express.Router();
const Users = require('../models/user');
const User = Users.user;
const ACUser = Users.ac_user;
const HRUser = Users.hr_user;
const Record = require('../models/attendance_record');
const Location = require('../models/location');
const Faculty = require('../models/faculty');
const Department = require('../models/department');
const Course = require('../models/course');
const LeaveRequest = require('../models/leave_request');
const ChangeDayOff = require('../models/change_day_off');
const Slot = require('../models/slot');
const ReplacementRequest = require('../models/replacement_request');
const SlotLinking = require('../models/slot_linking');

const  jwt  =  require('jsonwebtoken');
const  bcrypt  =  require('bcryptjs');
const SECRET_KEY = "guc_staff_secret_key";

verify_token = function(token) {
  if (!token) return res.status(401).send('Access Denied, please log in first.');

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;
  } catch (er) {
    res.clearCookie("token");
    return res.status(400).send(er.message);
  }
}

router.post('/login', (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email) {
    res.json({
      error: "The email field is required"
    })
  } else {
    User.findOne({'email': email}, (err, user) => {
      if (err) return  res.status(500).send('Server error!');
      if (!user) return  res.status(404).send('User not found!');

      const  result  =  bcrypt.compareSync(password, user.password);
      if(!result) return  res.status(401).send('Password not valid!');

      const  first_login  =  bcrypt.compareSync(password, bcrypt.hashSync("123456"));
      
      accessToken = user.generate_token();

      return res.status(200)
      .cookie("access_token", accessToken, {httpOnly: true})
      .send({ "user":  user, "first_login": first_login});
    });
  }
})

router.post('/logout', (req, res, next) => {
  res.clearCookie("access_token");
  return res.send({ success: true });
});

router.get('/profile', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  
  User.findById(user.id, function(err, profile){
    const curr_month = moment().month() + 1;
    var balance = (curr_month * 2.5) + profile.leave_days;
    profile.leave_days = balance;
    console.log(balance);
    return res.status(200).send({"user": profile});
  });
});

router.post('/update_profile', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);

  const staff_id = req.body.staff_id;
  const name = req.body.name;
  const email = req.body.email;
  const salary = req.body.salary;
  const faculty = req.body.faculty;
  const department = req.body.department;

  User.findOne(user._id, function(err, profile){
    if(err) return res.send(err)

    if(staff_id && staff_id != profile.staff_id) return res.status(403).send("Staff id can't be changed.");
    if(name && name != profile.name) return res.status(403).send("Name can't be changed.");

    if(email && email != profile.email) profile.email = email;

    if(profile.staff_type == "hr") {
      if(salary && salary != profile.salary) profile.salary = salary;
    }
    else {
      if(faculty && faculty != profile.faculty) return res.status(403).send("Contact your HR to update your faculty.");
      if(department && department != profile.department) return res.status(403).send("Contact your HR to update your department.");
    }
    profile.save();
    return res.status(200).send({"user": profile});
  });
});

router.post('/reset_password', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  
  const password = req.body.password;
  const result  =  bcrypt.compareSync(password, user.password);
  if(!result) return  res.status(401).send('Password not valid!');
  
  new_password = bcrypt.hashSync(req.body.new_password);
  User.findOneAndUpdate(user._id, {'password': new_password}, function(err, result){
    if(err) return res.send(err)
    return res.status(200).send({"user": result});
  });
});

router.post('/sign_in', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  const date = new Date();

  Record.create({
    staff_id: user.staff_id,
    sign_in: Date.now(),
    sign_in_month: date.getMonth(),
    sign_in_day: date.getDay()
  })
  .then(data => res.status(200).json(data))
  .catch(next);
});

router.post('/sign_out', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);

  Record.findOneAndUpdate({staff_id: user.staff_id}, {'sign_out': Date.now()}, {sort: {'sign_in': -1}},
  function(err, result){
    if(err) return res.send(err)
    return res.status(200).send({"message": "Successfully signed out"});
  });
});

router.get('/records', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  const date = new Date();

  if (req.body.month) {
      Record.find({
        'staff_id': user.staff_id,
        'sign_in_month': req.body.month
      }, function(err, docs){
          if(err) return res.send(err);
          return res.status(200).send({'records': docs});
        next();
    });
  } else {
    Record.find({
        'staff_id': user.staff_id
      }, function(err, docs){
          if(err) return res.send(err);
          return res.status(200).send({'records': docs});
      next();
    });
  }
});

router.get('/missing_days', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);

  User.findById(user.id, function(err, profile){
    if(err) return res.send(err)
    Record.find({'staff_id': user.staff_id}, function(err, records){
      if(err) return res.send(err)
      LeaveRequest.find({'staff_id': user.staff_id, "status": "Accepted"}, function(err, leaves){
        if(err) return res.send(err)
        

        var start_date = moment(user.createdAt);//moment("2020-12-10T18:23:51.574Z");
        var end_date = moment(Date.now());
        var missing_days = [];

        for (var m = moment(start_date); m.isBefore(end_date); m.add(1, 'days')) {
          const this_date = new Date(m.format("YYYY-MM-DD"));
          const day = m.day();
          
          if (day == 5) continue;
          if (profile.day_off == day) continue;
          
          var cont = false;
          leaves.forEach(function(leave){
            if (moment(leave.leave_day).format('YYYY-MM-DD') ==  m.format('YYYY-MM-DD')) cont = true;
          });
          if(cont) continue;

          records.forEach(function(record){
            record_date = moment(record.sign_in);
            if(record_date.format('YYYY-MM-DD') == m.format('YYYY-MM-DD')){
              cont = true;
            };
          });
          if(cont) continue;

          missing_days.push(this_date);
        }

        return res.status(200).send({'missing_days': missing_days});
        
      });
    });
  });
});

router.get('/hours', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  
  User.findById(user.id, function(err, profile){
    if(err) return res.send(err)
    Record.find({'staff_id': user.staff_id}, function(err, records){
      if(err) return res.send(err)

      var mins = 0;
      
      records.forEach(function(record){
        var sig_in_time = moment(record.sign_in);
        var sig_out_time = moment(record.sign_out);
        var duration = moment.duration(sig_out_time.diff(sig_in_time));
        var mins_diff = duration.asMinutes() - 504;
        mins += mins_diff;
      })

      return res.status(200).send({'hours': mins});
      
    });
  });
});

// =================================================== HR Functions =============================================


router.post('/location', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != 'hr') return res.status(403).send('Only HR staff can do this.')

  if(!req.body.room) return res.json({error: "Room name is empty"}).send();
  if(!req.body.type) return res.json({error: "Room type is empty"}).send();
  if(!req.body.capacity) return res.json({error: "Room capacity is empty"}).send();

  Location.create(req.body, function (err, location) {
    if (err) return res.send(err);
    return res.status(200).json(location);
  });
});

router.patch('/location', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hr") return res.status(403).send('Only HR staff can do this.')

  if(!req.body._id) return res.json({error: "Room id is required for editing"}).send();
  const room_id = req.body._id;
  delete req.body._id;

  Location.findOneAndUpdate({"_id": room_id}, req.body, function(err, result){
    if(err) return res.send(err)

    if(!result) return res.send({"error": "Location not found"});
    return res.status(200).send({"success": "Location updated successfully."});
  });
});

router.delete('/location', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hr") return res.status(403).send('Only HR staff can do this.')

  if(!req.body._id) return res.json({error: "Room id is required for deleting"}).send();
  const room_id = req.body._id;

  Location.findOne({"_id": room_id}, function(err, result){
    if(err) return res.send(err);

    if(!result) return res.send({"error": "Location not found"});
    result.delete();
    return res.status(200).send({"success": "Location deleted successfully."});
  });
});


router.post('/faculty', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != 'hr') return res.status(403).send('Only HR staff can do this.')

  if(!req.body.name) return res.json({error: "Faculty name is empty"}).send();

  Faculty.create(req.body, function (err, faculty) {
    if (err) return res.send(err);
    return res.status(200).json(faculty);
  });
});

router.patch('/faculty', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hr") return res.status(403).send('Only HR staff can do this.')

  if(!req.body._id) return res.json({error: "Faculty id is required for editing"}).send();
  const faculty_id = req.body._id;
  delete req.body._id;

  Faculty.findOneAndUpdate({"_id": faculty_id}, req.body, function(err, result){
    if(err) return res.send(err);

    if(!result) return res.send({"error": "Faculty not found"});
    return res.status(200).send({"success": "Faculty updated successfully."});
  });
});

router.delete('/faculty', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hr") return res.status(403).send('Only HR staff can do this.')

  if(!req.body._id) return res.json({error: "Faculty id is required for deleting"}).send();
  const faculty_id = req.body._id;

  Faculty.findOne({"_id": faculty_id}, function(err, result){
    if(err) return res.send(err);

    if(!result) return res.send({"error": "Faculty not found"});
    result.delete();
    return res.status(200).send({"success": "Faculty deleted successfully."});
  });
});


router.post('/department', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != 'hr') return res.status(403).send('Only HR staff can do this.')

  if(!req.body.faculty) return res.json({error: "Faculty id is empty"}).send();
  if(!req.body.name) return res.json({error: "Department name is empty"}).send();

  Department.create(req.body, function (err, department) {
    if (err) return res.send(err);
    Faculty.findById(req.body.faculty, function (err, faculty) {
      if (err) return res.send(err);

      faculty.departments.push(department);
      faculty.save();
    });
    return res.status(200).json(department);
  });
});

router.patch('/department', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hr") return res.status(403).send('Only HR staff can do this.')

  if(!req.body._id) return res.json({error: "Department id is required for editing"}).send();
  const department_id = req.body._id;
  delete req.body._id;

  Department.findOneAndUpdate({"_id": department_id}, req.body, function(err, result){
    if(err) return res.send(err);

    if(!result) return res.send({"error": "Department not found"});
    return res.status(200).send({"success": "Department updated successfully."});
  });
});

router.delete('/department', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hr") return res.status(403).send('Only HR staff can do this.')

  if(!req.body._id) return res.json({error: "Department id is required for deleting"}).send();
  const department_id = req.body._id;

  Department.findOne({"_id": department_id}, function(err, result){
    if(err) return res.send(err);
    if(!result) return res.send({"error": "Department not found"});

    Faculty.findById(result.faculty, function (err, faculty) {
      if(err) return res.send(err);
      const department_index = faculty.departments.indexOf(department_id);
      faculty.departments.splice(department_index, 1);
      faculty.save();
    });
    result.delete();
    return res.status(200).send({"success": "Department deleted successfully."});
  });
});


router.post('/course', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != 'hr') return res.status(403).send('Only HR staff can do this.')

  if(!req.body.department) return res.json({error: "Department id is empty"}).send();
  if(!req.body.name) return res.json({error: "Course name is empty"}).send();

  Course.create(req.body, function (err, course) {
    if (err) return res.send(err);
    Department.findById(req.body.department, function (err, department) {
      if (err) return res.send(err);

      department.courses.push(course);
      department.save();
    });
    return res.status(200).json(course);
  });
});

router.patch('/course', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hr") return res.status(403).send('Only HR staff can do this.')

  if(!req.body._id) return res.json({error: "Course id is required for editing"}).send();
  const course_id = req.body._id;
  delete req.body._id;

  Course.findOneAndUpdate({"_id": course_id}, req.body, function(err, result){
    if(err) return res.send(err);

    if(!result) return res.send({"error": "Course not found"});
    return res.status(200).send({"success": "Course updated successfully."});
  });
});

router.delete('/course', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hr") return res.status(403).send('Only HR staff can do this.')

  if(!req.body._id) return res.json({error: "Course id is required for deleting"}).send();
  const course_id = req.body._id;

  Course.findOne({"_id": course_id}, function(err, result){
    if(err) return res.send(err);
    if(!result) return res.send({"error": "Course not found"});

    Department.findById(result.department, function (err, department) {
      const course_index = department.courses.indexOf(course_id);
      department.courses.splice(course_index, 1);
      department.save();

      result.delete();
      return res.status(200).send({"success": "Course deleted successfully."});
    });
  });
});


router.post('/staff', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
 if(user.type != "hr") return res.status(403).send('Only HR staff can do this.')
  
  if(!req.body.email) return res.json({error: "Email is empty"}).send();
  if(!req.body.name) return res.json({error: "Staff name is empty"}).send();
  if(!req.body.staff_type) return res.json({error: "Staff type is empty"}).send();
  if(!req.body.salary) return res.json({error: "Salary is empty"}).send();
  if(!req.body.office) return res.json({error: "Office is empty"}).send();

  Location.findById(req.body.office, function (err, office) {
    if (err) return res.send(err);
  if (office.staff_count >= office.capacity) return res.json({error: "This office is full"}).send();
    
    req.body.password = bcrypt.hashSync("123456");
    if (req.body.staff_type == "hr") {
      User.create(req.body, function (err, user) {
        if (err) return res.send(err);
  
        office.capacity += 1;
        office.save();
  
        return res.status(200).json(user);
      });
    } else {
      ACUser.create(req.body, function (err, user) {
        if (err) return res.send(err);

        office.capacity += 1;
        office.save();

        return res.status(200).json(user);
      });
    }
  });
});

router.patch('/staff', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hr") return res.status(403).send('Only HR staff can do this.');

  if(!req.body.staff_id) return res.json({error: "Staff id is required for editing"}).send();
  const staff_id = req.body.staff_id;
  delete req.body.staff_id;

  if(req.body.password) req.body.password = bcrypt.hashSync(req.body.password);
  if (req.body.staff_type){
    User.findOneAndUpdate({"staff_type": req.body.staff_type}, req.body, function(err, result){
      if(err) return res.send(err);
  
      if(!result) return res.status(404).send({"error": "Staff not found"});
      return res.status(200).send({"success": "Staff updated successfully."});
    });
  }

  User.findOneAndUpdate({"staff_id": staff_id}, req.body, function(err, result){
    if(err) return res.send(err);

    if(!result) return res.status(404).send({"error": "Staff not found"});
    return res.status(200).send({"success": "Staff updated successfully."});
  });
});

router.delete('/staff', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hr") return res.status(403).send('Only HR staff can do this.');

  if(!req.body.staff_id) return res.json({error: "Staff id is required for deleting"}).send();
  const staff_id = req.body.staff_id;

  User.findOne({"staff_id": staff_id}, function(err, result){
    if(err) return res.send(err);
    if(!result) return res.status(404).send({"error": "Staff member not found"});

    result.delete();
    return res.status(200).send({"success": "Staff member deleted successfully."});
  });
});


router.post('/manual-signin', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hr") return res.status(403).send('Only HR staff can do this.')
  
  
  if(!req.body.staff_id) return res.json({error: "Staff id is requried"}).send();
  const date = new Date();

  Record.create({
    staff_id: req.body.staff_id,
    sign_in: Date.now(),
    sign_in_month: date.getMonth(),
    sign_in_day: date.getDay()
  })
  .then(data => res.status(200).json(data))
  .catch(next);
});

router.post('/manual-signout', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hr") return res.status(403).send('Only HR staff can do this.')
  
  
  if(!req.body.staff_id) return res.json({error: "Staff id is requried"}).send();
  const date = new Date();

  Record.findOneAndUpdate({staff_id: req.body.staff_id}, {'sign_out': Date.now()}, {sort: {'sign_in': -1}},
  function(err, result){
    if(err) return res.send(err)
    return res.status(200).send({"message": "Successfully signed out"});
  });
});

router.post('/staff-records', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hr") return res.status(403).send('Only HR staff can do this.')
  
  
  if(!req.body.staff_id) return res.json({error: "Staff id is requried"}).send();
  Record.find({'staff_id': user.staff_id}, function(err, docs){
      if(err) return res.send(err);

      return res.status(200).send({'records': docs});
  });
});

router.patch('/staff-records', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hr") return res.status(403).send('Only HR staff can do this.');
  
  if(!req.body.staff_id) return res.json({error: "Staff id is requried"}).send();
  if(req.body.staff_id == user.staff_id) return res.json({error: "You can't update your own records"}).send();

  Record.findById(req.body.record_id, function (err, record) {
    if (err) return res.send(err);

    if(record) {
      if(req.body.sign_in) record.sign_in = req.body.sign_in;
      if(req.body.sign_out) record.sign_out = req.body.sign_out;
      record.save();
      return res.status(200).json(record);
    } 
    Record.create(req.body, function (err, new_record) {
      if (err) return res.send(err);

      return res.status(200).json(new_record);
    });
  });
});

router.get('/staff-missing-days', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hr") return res.status(403).send('Only HR staff can do this.');
  
  Record.find({}, function(err, records) {
    if(err) return res.send(err)
    User.find({}, function(err, users) {
      if(err) return res.send(err)
      LeaveRequest.find({'staff_id': user.staff_id, "status": "Accepted"}, function(err, leaves){
        if(err) return res.send(err)

        var result_users = [];

        users.forEach(function(user) {
          var user_records = {"staff_id": user.staff_id};

          var start_date = moment("2020-12-10T18:23:51.574Z");//moment(user.createdAt);
          var end_date = moment(Date.now());
          var missing_days = [];

          for (var m = moment(start_date); m.isBefore(end_date); m.add(1, 'days')) {
            const this_date = new Date(m.format("YYYY-MM-DD"));
            const day = m.day();
            
            if (day == 5) continue;
            if (user.day_off == day) continue;
          
            var cont = false;
            leaves.forEach(function(leave){
              if (moment(leave.leave_day).format('YYYY-MM-DD') ==  m.format('YYYY-MM-DD')) cont = true;
            });
            if(cont) continue;

            records.forEach(function(record){
              if (record.staff_id != user.staff_id) return;
              record_date = moment(record.sign_in);
              if(record_date.format('YYYY-MM-DD') == m.format('YYYY-MM-DD')){
                cont = true;
              };
            });
            if(cont) continue;

            missing_days.push(this_date);
            
            var mins = 0;
            
            records.forEach(function(record){
              var sig_in_time = moment(record.sign_in);
              var sig_out_time = moment(record.sign_out);
              var duration = moment.duration(sig_out_time.diff(sig_in_time));
              var mins_diff = duration.asMinutes() - 504;
              mins += mins_diff;
            })
          }
            
          if(mins >= 0 && !missing_days) return;
          if(missing_days) user_records["missing_days"] = missing_days;
          if(mins < 0) user_records["mins"] = mins;
          
          result_users.push(user_records);
        });

        return res.status(200).send({'users': result_users});
      });
    });
  });
});

router.patch('/staff-salary', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hr") return res.status(403).send('Only HR staff can do this.');

  if(!req.body.salary) return res.json({error: "Enter new staff salary"}).send();
  if(!req.body.staff_id) return res.json({error: "Staff id is required for editing"}).send();
  const staff_id = req.body.staff_id;

  User.findOne({"staff_id": staff_id}, function(err, result){
    if(err) return res.send(err);
    if(!result) return res.send({"error": "Staff member not found"});

    result.salary = req.body.salary;
    result.save();
    return res.status(200).send({"user": result, "success": "Staff salary updated successfully."});
  });
});


// =================================================== Academic Members Functions =============================================

// =================================================== HOD Functions =============================================


router.post('/course-instructor', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hod") return res.status(403).send('Only Head of department can do this.')
  
  if(!req.body.staff_id) return res.json({error: "Staff id is needed"}).send();
  if(!req.body.course_id) return res.json({error: "Course id is needed"}).send();

  Course.findById(req.body.course_id, function (err, course) {
    if (err) return res.send(err);
    if (!course) return res.json({error: "Course not found"}).send();
    
    User.findOne({"staff_id": req.body.staff_id}, function (err, user) {
      if (err) return res.send(err);
      if (!user) return res.json({error: "Staff not found"}).send();

      course.instructors.push(user.id);
      course.save();
      user.courses.push(course.id);
      user.save();

      return res.status(200).json(course);
    });
  });
});

router.delete('/course-instructor', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hod") return res.status(403).send('Only Head of department can do this.')

  if(!req.body.staff_id) return res.json({error: "Staff id is needed"}).send();
  if(!req.body.course_id) return res.json({error: "Course id is needed"}).send();

  Course.findById(req.body.course_id, function (err, course) {
    if (err) return res.send(err);
    if (!course) return res.json({error: "Course not found"}).send();
    
    User.findOne({"staff_id": req.body.staff_id}, function (err, user) {
      if (err) return res.send(err);
      if (!user) return res.json({error: "Staff not found"}).send();

      const user_index = course.instructors.indexOf(user.id);
      course.instructors.splice(user_index, 1);
      course.save();

      const course_index = user.courses.indexOf(course.id);
      user.courses.splice(course_index, 1);
      user.save();

      return res.status(200).json(course);
    });
  });
});

router.get('/deaprtment-staff', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hod" && user.type != "ci") return res.status(403).send('Only Head of department can do this.')
  
  if(req.body.staff_id) {
    User.findOne({"staff_id": req.body.staff_id}, function (err, result) {
      if (err) return res.send(err);
      if (!result) return res.json({error: "Staff member not found"}).send();

      if (result.department != user.department) return res.json({error: "This staff member is not in your department"}).send();

      return res.status(200).json(result);
    });
  } else if(!req.body.course_id) {
    ACUser.find({"department": user.department}, function (err, users) {
      if (err) return res.send(err);
      
      return res.status(200).json(users);
    });
  } else {
    ACUser.find({"department": user.department, "courses": req.body.course_id}, function (err, users) {
      if (err) return res.send(err);
      
      return res.status(200).json(users);
    });
  }
});
router.post('/deaprtment-staff', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hod" && user.type != "ci") return res.status(403).send('Only Head of department can do this.')
  
  if(req.body.staff_id) {
    User.findOne({"staff_id": req.body.staff_id}, function (err, result) {
      if (err) return res.send(err);
      if (!result) return res.json({error: "Staff member not found"}).send();

      if (result.department != user.department) return res.json({error: "This staff member is not in your department"}).send();

      return res.status(200).json(result);
    });
  } else if(!req.body.course_id) {
    ACUser.find({"department": user.department}, function (err, users) {
      if (err) return res.send(err);
      
      return res.status(200).json(users);
    });
  } else {
    ACUser.find({"department": user.department, "courses": req.body.course_id}, function (err, users) {
      if (err) return res.send(err);
      
      return res.status(200).json(users);
    });
  }
});

router.get('/deaprtment-requests', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hod") return res.status(403).send('Only Head of department can do this.')
  
  LeaveRequest.find({"department": user.department}, function (err, leave_requests) {
    if (err) return res.send(err);
    ChangeDayOff.find({"department": user.department}, function (err, dayoff_requests) {
      if (err) return res.send(err);

      results = {"leave requests": leave_requests, "Change Day off Requests": dayoff_requests};
      return res.status(200).json(results);
    });
  });
});

router.post('/deaprtment-requests-accept', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hod") return res.status(403).send('Only Head of department can do this.')
  
  if(!req.body.request_id) return res.json({error: "Request id is required"}).send();

  LeaveRequest.findById(req.body.request_id, function (err, leave_request) {
    if (err) return res.send(err);

    if (leave_request) {
      User.findOne({"staff_id": leave_request.staff_id}, function(err, user) {
        if (err) return res.send(err);
        console.log(user);

        if (leave_request.leave_type == "Annual" || leave_request.leave_type == "Accidental") {
          user.leave_days += 1;
          user.save();
        }
        
        leave_request.status = "Accepted";
        leave_request.save();
        return res.status(200).json({success: "Leave Request accepted"}).send();
      });
    } else {
      ChangeDayOff.findById(req.body.request_id, function (err, dayoff_request) {
        if (err) return res.send(err);

        if (dayoff_request) {
          User.findOneAndUpdate({"staff_id": dayoff_request.staff_id}, {"day_off": dayoff_request.new_day_off},
          function (err, user){
            if (err) return res.send(err);

            dayoff_request.status = "Accepted";
            dayoff_request.save();
    
            return res.status(200).json({success: "Request accepted", "user": user}).send();
          });
        } else {
          return res.json({error: "Request not found"}).send();
        }
      });
    }
  });
});

router.post('/deaprtment-requests-reject', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hod") return res.status(403).send('Only Head of department can do this.')
  
  if(!req.body.request_id) return res.json({error: "Request id is required"}).send();

  LeaveRequest.findById(req.body.request_id, function (err, leave_request) {
    if (err) return res.send(err);

    if (leave_request) {
      if(req.body.response_reason) leave_request.response_reason = req.body.response_reason;
      leave_request.status == "Rejected";
      leave_request.save();
      return res.status(200).json({success: "Request rejected"}).send();
    } else {
      ChangeDayOff.findById(req.body.request_id, function (err, dayoff_request) {
        if (err) return res.send(err);

        if (dayoff_request) {
          if(req.body.response_reason) dayoff_request.response_reason = req.body.response_reason;
          dayoff_request.status == "Rejected";
          dayoff_request.save();
    
          return res.status(200).json({success: "Request accepted", "user": user}).send();
        } else {
          return res.json({error: "Request not found"}).send();
        }
      });
    }
  });
});

router.post('/deaprtment-course-coverage', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hod") return res.status(403).send('Only Head of department can do this.')

  if(!req.body.course_id)  return res.json({error: "Course id is required"}).send();

  Slot.find({"course": req.body.course_id}, function (err, slots) {
    if (err) return res.send(err);
    
    var assigned_num = 0;
    var total_slots = 0;
    slots.forEach(function(slot){
      if(slot.assigned_staff_id) assigned_num++;
      total_slots++;
    });
    
    var coverage = (total_slots == 0)? 100 : (assigned_num/total_slots);
    return res.status(200).json({"coverage": coverage});
  });
});

router.post('/deaprtment-teaching-assignments', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "hod") return res.status(403).send('Only Head of department can do this.')

  if(!req.body.course_id)  return res.json({error: "Course id is required"}).send();

  Slot.find({"course": req.body.course_id}, function (err, slots) {
    if (err) return res.send(err);
    
    return res.status(200).json(slots);
  });
});


// ===================================================  CI Functions =============================================


router.post('/instructor-course-coverage', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "ci") return res.status(403).send('Only Course Instructor can do this.')

  if(!req.body.course_id) return res.json({error: "Course id is required"}).send();

  Slot.find({"course": req.body.course_id}, function (err, slots) {
    if (err) return res.send(err);
    
    var assigned_num = 0;
    var total_slots = 0;
    slots.forEach(function(slot){
      if(slot.assigned_staff_id) assigned_num++;
      total_slots++;
    });

    var coverage = (total_slots == 0)? 100 : (assigned_num/total_slots);
    
    return res.status(200).json({"coverage": coverage});
  });
});

router.get('/instructor-course-slots', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "ci") return res.status(403).send('Only Course Instrcutot can do this.')

  Slot.find({}, function (err, slots) {
    if (err) return res.send(err);

    Course.find({"instructors": user.id}, function (err, courses) {
      if (err) return res.send(err);
      
      result_courses = [];
      courses.forEach(function(course){
        var result_course = {"course_name": course.name, "slots": []};
        slots.forEach(function(slot){
          if(slot.course == course.id) result_course.slots.push(slot);
        });
        result_courses.push(result_course);
      });
      
      return res.status(200).json(result_courses);
    });
  });
});

router.post('/instructor-assign-slot', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "ci") return res.status(403).send('Only Course Instructor can do this.')
  
  if(!req.body.staff_id)  return res.json({error: "Staff id is required"}).send();
  if(!req.body.slot_id)  return res.json({error: "Slot id is required"}).send();


  Slot.findById(req.body.slot_id, function (err, slot) {
    if (err) return res.send(err);
    if (!slot) return res.json({error: "Slot not found"}).send();

    slot.assigned_staff_id = req.body.staff_id;
    slot.save();
    
    return res.status(200).json({success: "Staff assigned"}).send();
  });
});

router.delete('/instructor-assign-slot', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "ci") return res.status(403).send('Only Course Instructor can do this.')
  
  if(!req.body.slot_id)  return res.json({error: "Slot id is required"}).send();


  Slot.findById(req.body.slot_id, function (err, slot) {
    if (err) return res.send(err);
    if (!slot) return res.json({error: "Slot not found"}).send();

    slot.assigned_staff_id = null;
    slot.save();
    
    return res.status(200).json({success: "Staff cleared from slot."}).send();
  });
});

router.post('/instructor-assign-coordinator', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "ci") return res.status(403).send('Only Course Instructor can do this.')
  
  if(!req.body.staff_id)  return res.json({error: "Staff id is required"}).send();
  if(!req.body.course_id)  return res.json({error: "Course id is required"}).send();


  Course.findById(req.body.course_id, function (err, course) {
    if (err) return res.send(err);
    if (!course) return res.json({error: "Course not found"}).send();
    User.find({"staff_id": req.body.staff_id}, )

    course.coordinator = req.body.staff_id;
    course.save();
    
    return res.status(200).json({success: "Coordinator assigned"}).send();
  });
});


// ===================================================  CC Functions =============================================

router.post('/slot-linking', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "cc") return res.status(403).send('Only Course coordinator can do this.')

  if(!req.body.course) return res.json({error: "Course id is empty"}).send();

  SlotLinking.find({"course": req.body.course}, function (err, requests) {
    if (err) return res.send(err);
    
    return res.status(200).json(requests);
  });
});


router.post('/slot-linking-accept', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "cc") return res.status(403).send('Only Course coordinator can do this.')

  if(!req.body.request_id) return res.json({error: "Request id is empty"}).send();

  SlotLinking.findById(req.body.request_id, function (err, request) {
    if (err) return res.send(err);
    if(!request) return res.json({error: "Request not found"}).send();

    Slot.findById(request.slot, function (err, slot) {
      if (err) return res.send(err);

      slot.assigned_staff_id = request.requester_staff_id;
      slot.save();
      request.status = "Accepted";
      request.save;
      
      return res.status(200).json({"Success": "Request Accepted Successfully"});
    });
  });
});


router.post('/slot-linking-reject', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != "cc") return res.status(403).send('Only Course coordinator can do this.')

  if(!req.body.request_id) return res.json({error: "Request id is empty"}).send();

  SlotLinking.findById(req.body.request_id, function (err, request) {
    if (err) return res.send(err);
    if(!request) return res.json({error: "Request not found"}).send();

    request.status = "Rejected";
    request.save;
    
    return res.status(200).json({"Success": "Request Accepted Successfully"});
  });
});



router.post('/slot', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != 'cc') return res.status(403).send('Only Course coordinator can do this.')

  if(!req.body.course) return res.json({error: "Course id is empty"}).send();
  if(!req.body.slot_day) return res.json({error: "Slot Day is empty"}).send();
  if(!req.body.slot_number) return res.json({error: "Slot Number is empty"}).send();
  if(!req.body.slot_type) return res.json({error: "Slot Type is empty"}).send();

  Slot.create(req.body, function (err, slot) {
    if (err) return res.send(err);
    return res.status(200).json(slot);
  });
});

router.patch('/slot', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != 'cc') return res.status(403).send('Only Course coordinator can do this.')

  if(!req.body._id) return res.json({error: "Slot id is required for editing"}).send();
  const slot_id = req.body._id;
  delete req.body._id;

  Slot.findOneAndUpdate({"_id": slot_id}, req.body, function(err, result){
    if(err) return res.send(err)

    if(!result) return res.send({"error": "Slot not found"});
    return res.status(200).send({"success": "Slot updated successfully."});
  });
});

router.delete('/slot', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type != 'cc') return res.status(403).send('Only Course coordinator can do this.')

  if(!req.body._id) return res.json({error: "Slot id is required for deleting"}).send();
  const slot_id = req.body._id;

  Slot.findOne({"_id": slot_id}, function(err, result){
    if(err) return res.send(err);

    if(!result) return res.send({"error": "Slot not found"});
    result.delete();
    return res.status(200).send({"success": "Slot deleted successfully."});
  });
});


// ===================================================  AM Functions =============================================

router.get('/academic-schedule', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type == "hr") return res.status(403).send('Only Academic Members can do this.')

  
  Slot.find({"assigned_staff_id": user.staff_id}, function (err, slots) {
    if (err) return res.send(err);
    ReplacementRequest.find({$or:[{'requester_staff_id': user.staff_id},
    {'receiver_staff_id': user.staff_id}]}, function (err, requests) {
      if (err) return res.send(err);

      return res.status(200).json(requests);
    });
    return res.status(200).json({"schedule": slots, "replacements": requests});
  });
});

router.get('/academic-replacement', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type == "hr") return res.status(403).send('Only Academic Members can do this.')

  ReplacementRequest.find({$or:[{'requester_staff_id': user.staff_id},
  {'receiver_staff_id': user.staff_id}]}, function (err, requests) {
    if (err) return res.send(err);

    return res.status(200).json(requests);
  });
});

router.post('/academic-replacement', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type == "hr") return res.status(403).send('Only Academic Members can do this.')

  
  if(!req.body.slot) return res.json({error: "Slot id is empty"}).send();
  if(!req.body.receiver_staff_id) return res.json({error: "Recevier staff id is empty"}).send();

  req.body.requester_staff_id = user.staff_id;

  ReplacementRequest.create(req.body, function (err, request) {
    if (err) return res.send(err);

    return res.status(200).json(request);
  });
});

router.post('/academic-replacement-accept', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type == "hr") return res.status(403).send('Only Academic Members can do this.')

  
  if(!req.body.request_id) return res.json({error: "Request id is empty"}).send();

  req.body.requester_staff_id = user.staff_id;

  ReplacementRequest.findById(req.body.request_id, function (err, request) {
    if (err) return res.send(err);
    if(!request) return res.json({error: "Request not found"}).send();
    
    request.status = "Accepted";
    request.save;

    return res.status(200).json(request);
  });
});

router.post('/academic-slot-linking', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type == "hr") return res.status(403).send('Only Academic Members can do this.')

  
  if(!req.body.slot) return res.json({error: "Slot id is empty"}).send();
  if(!req.body.course) return res.json({error: "Course id is empty"}).send();

  req.body.requester_staff_id = user.staff_id;

  SlotLinking.create(req.body, function (err, request) {
    if (err) return res.send(err);
    
    return res.status(200).json(request);
  });
});

router.post('/academic-change-dayoff', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type == "hr") return res.status(403).send('Only Academic Members can do this.')

  
  if(!req.body.new_day_off) return res.json({error: "New day off is empty"}).send();

  req.body.staff_id = user.staff_id;
  req.body.department = user.department;

  ChangeDayOff.create(req.body, function (err, request) {
    if (err) return res.send(err);
    
    return res.status(200).json(request);
  });
});

router.post('/academic-leave', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type == "hr") return res.status(403).send('Only Academic Members can do this.')

  if(!req.body.leave_day) return res.json({error: "Leave day is empty"}).send();
  if(!req.body.leave_type) return res.json({error: "Leave type is empty"}).send();

  const leave_date = moment(req.body.leave_day);
  if(req.body.leave_type == "Annual" && moment().diff(leave_date, 'days') > 0)  return res.json({error: "Date already passed"}).send();

  req.body.staff_id = user.staff_id;
  req.body.department = user.department;

  LeaveRequest.create(req.body, function (err, request) {
    if (err) return res.send(err);
    
    return res.status(200).json(request);
  });
});

router.get('/academic-requests', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type == "hr") return res.status(403).send('Only Academic Members can do this.')

  LeaveRequest.find({"staff_id": user.staff_id}, function (err, leaves) {
    if (err) return res.send(err);
    ChangeDayOff.find({"staff_id": user.staff_id}, function (err, dayoffs) {
      if (err) return res.send(err);
      SlotLinking.find({"staff_id": user.staff_id}, function (err, slotlinking) {
        if (err) return res.send(err);
        ReplacementRequest.find({"staff_id": user.staff_id}, function (err, replacements) {
          if (err) return res.send(err);
    
          return res.status(200).json({"leave requests": leaves, "change day off request": dayoffs,
          "slot linking requests": slotlinking, "replacement requests": replacements});
        });
      });
    });
  });
});

router.delete('/academic-cancel-request', (req, res, next) => {
  const token = req.cookies.access_token;
  const user = verify_token(token);
  if(user.type == "hr") return res.status(403).send('Only Academic Members can do this.')

  if(!req.body.request_id) return res.json({error: "Request id is required"}).send();
  
  LeaveRequest.findById(req.body.request_id, function (err, leave) {
    if (err) return res.send(err);
    if (leave && leave.status == "Pending") {
      leave.delete();
      return res.status(200).json({"success": "leave request deleted"});
    }

    ChangeDayOff.findById(req.body.request_id, function (err, dayoff) {
      if (err) return res.send(err);
      if (dayoff && dayoff.status == "Pending") {
        dayoff.delete();
        return res.status(200).json({"success": "change dayoff request deleted"});
      }

      SlotLinking.findById(req.body.request_id, function (err, slotlinking) {
        if (err) return res.send(err);
        if (slotlinking && slotlinking.status == "Pending") {
          slotlinking.delete();
          return res.status(200).json({"success": "slotlinking request deleted"});
        }

        ReplacementRequest.findById(req.body.request_id, function (err, replacement) {
          if (err) return res.send(err);
          if (replacement && replacement.status == "Pending") {
            replacement.delete();
            return res.status(200).json({"success": "replacement request deleted"});
          }
        });
      });
    });
  });
});

module.exports = router;
