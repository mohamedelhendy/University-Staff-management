note that we have worked on other repository and then pushed the project here at the end
1- run index.js
2- the port is 5000
the main hr account is 
 {
	"email": "hamada@gmail.com",
	"password": "pass"
}

3-

Functionality: login
Route: http://localhost:5000/api/login
Request type: post
Parameters: {
	"email": "hamada@gmail.com",
	"password": "pass"
}
Response : the user logged in profile

Functionality: logout
Route: http://localhost:5000/api/logout
Request type: post
Parameters: 
Response : success logout or err message

Functionality: view profile
Route: http://localhost:5000/api/profile
Request type: get
Parameters:
Response : logged in user profile

Functionality: update profile
Route: http://localhost:5000/api/update_profile
Request type: post
Parameters: {
	"email": "hamada@gmail.com",
	"salary":550
}
Response : the updated profile

Functionality: reset password
Route: http://localhost:5000/api/reset_password
Request type: post
Parameters: {
	"password": "123456",
	"new_password": "pass"
}
Response : the updated profile

Functionality: sigin (enter the campus)
http://localhost:5000/api/sign_in
Request type: post
Parameters: 
Response : current attendance info 

Functionality: signout
http://localhost:5000/api/sign_out
Request type: post
Parameters:
Response : signout successfully or err message

Functionality: view attendance
Route: http://localhost:5000/api/records
Request type: get
Response : array of attendance records
example         {
            "_id": "5fe5f1e5abe77021408f8fbc",
            "staff_id": "hr-1",
            "sign_in": "2020-12-25T14:06:29.853Z",
            "sign_in_month": 11,
            "sign_in_day": 5,
            "__v": 0
        },

Functionality: view missing days
Route: http://localhost:5000/api/missing_days
Request type: get
Parameters: 
Response : array of missing days

Functionality: view missing hours
Route: http://localhost:5000/api/hours
Request type: get
Parameters: 
Response : missing hours

==========================HR functions=============================

Functionality: add location
Route: http://localhost:5000/api/location
Request type: post
Parameters:{
	"room": "C7-301",
	"type": "Office",
	"capacity": 25
}
Response : the created room info
!! important !! keep track of office _id to edit or to assign staff because its the only thing we cant change

Functionality: edit location
Route: http://localhost:5000/api/location
Request type: patch
Parameters:{
	"_id": "5fe5f437abe77021408f8fbe",
	"room": "C7-405",
	"type": "Lab",
	"capacity": 25
}
Response : success or err message

Functionality: delete location
Route: http://localhost:5000/api/location
Request type: delete
Parameters: {
	"_id": "5fe5f437abe77021408f8fbe"
}
Response : success or err message

Functionality: add faculty
Route: http://localhost:5000/api/faculty
Request type: post
Parameters:{
	"name": "Engineering"
}
Response : the created faculty info
!! important !! keep track of faculty _id to edit or to delete because its the only thing we cant change

Functionality: edit faculty
Route: http://localhost:5000/api/faculty
Request type: patch
Parameters:{
	"_id": "5fe5f71babe77021408f8fbf",
	"name": "Test2"
}
Response : success or err message

Functionality: delete faculty
Route: http://localhost:5000/api/faculty
Request type: delete
Parameters: {
	"_id": "5fe5f71babe77021408f8fbf"
}
Response : success or err message

Functionality: add department
Route: http://localhost:5000/api/department
Request type: post
Parameters:{
	"faculty": "5fe5f71babe77021408f8fbf",
	"name": "MET"
}
Response : the created department info
!! important !! keep track of department _id to edit or to delete because its the only thing we cant change

Functionality: edit department
Route: http://localhost:5000/api/department
Request type: patch
Parameters:{
	"_id": "5fe5f812abe77021408f8fc0",
	"name": "DMET"
}
Response : success or err message

Functionality: delete department
Route: http://localhost:5000/api/department
Request type: delete
Parameters: {
	"_id": "5fe5f812abe77021408f8fc0"
}
Response : success or err message

Functionality: add course
Route: http://localhost:5000/api/course
Request type: post
Parameters:{
	"department": "5fe5f812abe77021408f8fc0",
	"name": "ACL"
}
Response : the created course info
!! important !! keep track of course _id to edit or to delete because its the only thing we cant change

Functionality: edit course
Route: http://localhost:5000/api/course
Request type: patch
Parameters:{
	"_id": "5fe5f8f9abe77021408f8fc2",
	"name": "cs7"
}
Response : success or err message

Functionality: delete course
Route: http://localhost:5000/api/course
Request type: delete
Parameters: {
	"_id": "5fe5f8f9abe77021408f8fc2"
}
Response : success or err message

Functionality: add user
Route: http://localhost:5000/api/staff
Request type: post
Parameters: {
	"name": "user1",
	"email": "test_hod2@email.com",
	"office": "5fe5f437abe77021408f8fbe",
	"salary": 123,
	"day_off": 0,
	"staff_type": "hod",
	"faculty": "5fe5f71babe77021408f8fbf",
	"department": "5fe5f812abe77021408f8fc0"
}
Response : the created user info
keep track of staff id
office id and faculty id and department id must be ids of mongo to keep track even if we change its name 

Functionality: edit user
Route: http://localhost:5000/api/staff
Request type: patch
Parameters:{
	"name": "user1",
	"staff_id":"ac-1",
	"email": "test_hod2@email.com",
	"salary": 123,
	"day_off": 0,
	"staff_type": "hod",
	"faculty": "5fe5f71babe77021408f8fbf",
	"department": "5fe5f812abe77021408f8fc0"
}
Response : success or err message

Functionality: delete user
Route: http://localhost:5000/api/staff
Request type: delete
Parameters: {
	"staff_id":"ac-1"
}
Response : success or err message

Functionality: manually signin
Route: http://localhost:5000/api/manual-signin
Request type: post
Parameters: {
	"staff_id":"ac-1"
}
Response : attendance details

Functionality: manually signout
Route: http://localhost:5000/api/manual-signout
Request type: post
Parameters: {
	"staff_id":"ac-1"
}
Response : success or err message


Functionality: view staff attendance record
Route: http://localhost:5000/api/staff-records
Request type: post
Parameters:{
	"staff_id": "ac-1"
}
Response : array of attendance records
{
    "records": [
        {
            "_id": "5fe5f1e5abe77021408f8fbc",
            "staff_id": "hr-1",
            "sign_in": "2020-12-25T14:06:29.853Z",
            "sign_in_month": 11,
            "sign_in_day": 5,
            "__v": 0
        },

Functionality: get staff with missing days and mins 
Route: http://localhost:5000/api/staff-missing-days
Request type: get
Parameters: 
Response : array of every user has missing day or mins
{
    "users": [
        {
            "staff_id": "hr-1",
            "missing_days": [
                "2020-12-10T00:00:00.000Z",
                "2020-12-12T00:00:00.000Z",
                "2020-12-13T00:00:00.000Z",
                "2020-12-14T00:00:00.000Z",
                "2020-12-15T00:00:00.000Z",
                "2020-12-16T00:00:00.000Z",
                "2020-12-17T00:00:00.000Z",
                "2020-12-19T00:00:00.000Z",
                "2020-12-20T00:00:00.000Z",
                "2020-12-21T00:00:00.000Z",
                "2020-12-22T00:00:00.000Z",
                "2020-12-23T00:00:00.000Z",
                "2020-12-24T00:00:00.000Z"
            ],
            "mins": -1432.7281333333333
        },
        {
            "staff_id": "ac-1",
            "missing_days": [
                "2020-12-10T00:00:00.000Z",
                "2020-12-12T00:00:00.000Z",
                "2020-12-14T00:00:00.000Z",
                "2020-12-15T00:00:00.000Z",
                "2020-12-16T00:00:00.000Z",
                "2020-12-17T00:00:00.000Z",
                "2020-12-19T00:00:00.000Z",
                "2020-12-21T00:00:00.000Z",
                "2020-12-22T00:00:00.000Z",
                "2020-12-23T00:00:00.000Z",
                "2020-12-24T00:00:00.000Z"
            ],
            "mins": -1432.7280666666666
        }
    ]
}

Functionality: edit salary
Route:http://localhost:5000/api/staff-salary
Request type: patch
Parameters: {
	"staff_id": "hr-1",
	"salary": 7000
}
Response : updated salary and whole staff member profile

==========================HOD functions=============================

log in with an hod mail to use them

Functionality: assign instructor
Route: http://localhost:5000/api/course-instructor
Request type: post
Parameters: {
	"course_id": "5fe5f8f9abe77021408f8fc2",
	"staff_id": "ac-1"
}
Response : course details

Functionality: delete instructor
Route: http://localhost:5000/api/course-instructor
Request type: delete
Parameters: {
	"course_id": "5fe5f8f9abe77021408f8fc2",
	"staff_id": "ac-1"
}
Response : course details

Functionality: view department staff with thier dayoffs
Route: http://localhost:5000/api/deaprtment-staff
Request type: get
Parameters:
Response : array of users   {
        "courses": [],
        "leave_days": 0,
        "kind": "ac_user",
        "_id": "5fe5fafce8578b2a406e31f9",
        "name": "user1",
        "email": "test_hod2@email.com",
        "salary": 123,
        "day_off": 0,
        "staff_type": "hod",
        "faculty": "5fe5f71babe77021408f8fbf",
        "department": "5fe5f812abe77021408f8fc0",
        "password": "$2a$10$aWMLBZhj9yRe2T4KuV11E.y7zbtVUqSXqP96N7ROiLH2ouWu7LbQq",
        "createdAt": "2020-12-25T14:45:16.710Z",
        "updatedAt": "2020-12-25T15:42:30.180Z",
        "staff_id": "ac-1",
        "__v": 2
    }

Functionality: view dayoff of single staff of department
Route: http://localhost:5000/api/deaprtment-staff
Request type: post
Parameters: {
	"staff_id": "ac-1"
}
Response : the requested user and his profile details

Functionality: get department requests
Route: http://localhost:5000/api/deaprtment-requests
Request type: get
Parameters: 
Response : leave requests and dayoff change requests from his staff

Functionality: accept requests
Route: http://localhost:5000/api/deaprtment-requests-accept
Request type: post
Parameters:{
	"request_id": "5fe152ddad160d0dc865bf10"
}
Response : request accepted or err message

Functionality: get course coverge
how many courses are assigned to instructor
Route: http://localhost:5000/api/deaprtment-course-coverage
Request type: post
Parameters: {
	"course_id": "5fe5f8f9abe77021408f8fc2"
}
Response : the coverage

Functionality: view teaching assignments
Route: http://localhost:5000/api/deaprtment-teaching-assignments
Request type: post
Parameters: {
	"course_id": "5fe5f8f9abe77021408f8fc2"
}
Response : array of assignments

=====================================CI functions=======================
login as course instructor  to continue 
to add ci account firstly log in as hr and from route http://localhost:5000/api/staff
with Parameters {
	"name": "ci1",
	"email": "test_ci@email.com",
	"office": "5fe5f437abe77021408f8fbe",
	"salary": 123,
	"day_off": 0,
	"staff_type": "ci",
	"faculty": "5fe5f71babe77021408f8fbf",
	"department": "5fe5f812abe77021408f8fc0"
}

Functionality: get course coverage
how many courses are assigned to instructor
Route : http://localhost:5000/api/instructor-course-coverage
Request type: post
Parameters:{
	"course_id": "5fe5f8f9abe77021408f8fc2"
}
Response : course coverage

Functionality: view slot assignments
Route: http://localhost:5000/api/instructor-course-slots
Request type: get
Parameters: 
Response : array of slots assigned to him


Functionality: assign or update academic member to a slot
Route: http://localhost:5000/api/instructor-assign-slot
Request type: post
Parameters: {
"staff_id":"ac-4",
"slot_id":"5fe61b2b2404cb16bcbcfc57"
}
Response : success or err message

Functionality: delete assignment of academic member to a slot
Route: http://localhost:5000/api/instructor-assign-slot
Request type: delete
Parameters: {
"staff_id":"ac-4",
"slot_id":"5fe61b2b2404cb16bcbcfc57"
}
Response : deleted or err message

Functionality: assign ac to be course co ordinator
Route: http://localhost:5000/api/instructor-assign-coordinator
Request type: post
Parameters: {
"staff_id":"ac-1",
"course_id":"5fe5f8f9abe77021408f8fc2"
}
Response : assigned or err message

================================CC functions=============================

login as cc to continue 
to add cc account firstly log in as hr and from route http://localhost:5000/api/staff
with Parameters {
	"name": "cc1",
	"email": "test_ci@email.com",
	"office": "5fe5f437abe77021408f8fbe",
	"salary": 123,
	"day_off": 0,
	"staff_type": "cc",
	"faculty": "5fe5f71babe77021408f8fbf",
	"department": "5fe5f812abe77021408f8fc0"
}

Functionality: view slot linking requests
Route: hhttp://localhost:5000/api/slot-linking
Request type: post
Parameters:{
"course": "5fe5f8f9abe77021408f8fc2"
}
Response : array of requests

Functionality: accept slot linking requests
Route: http://localhost:5000/api/slot-linking-accept
Request type: post
Parameters:{
"request_id": "5fe62156351cc53e60a796f9"
}
Response : success or err message

Functionality: reject slot linking requests
Route: http://localhost:5000/api/slot-linking-reject
Request type: post
Parameters: {
"request_id": "5fe62156351cc53e60a796f9"
}
Response : success or err message

Functionality: add slot
Route: http://localhost:5000/api/slot
Request type: post
Parameters: {
	"slot_type":"Lab",
	"slot_number":2,
	"slot_day":"2",
	"course":"5fe5f8f9abe77021408f8fc2"		
}
Response : slot details

Functionality: update slot
Route: http://localhost:5000/api/slot
Request type: patch
Parameters: {
	"slot_type":"Lab",
	"slot_number":2,
	"slot_day":"2",
	"course":"5fe5f8f9abe77021408f8fc2"		
}
Response : slot details

Functionality: delete slot
Route: http://localhost:5000/api/login
Request type: delete
Parameters: {
	"slot_id":"5fe61b2b2404cb16bcbcfc57"
}
Response : success or err message

=====================================AM functions========================
login as am to continue 
to add cc account firstly log in as hr and from route http://localhost:5000/api/staff
with Parameters {
	"name": "cc1",
	"email": "test_am@email.com",
	"office": "5fe5f437abe77021408f8fbe",
	"salary": 123,
	"day_off": 0,
	"staff_type": "am",
	"faculty": "5fe5f71babe77021408f8fbf",
	"department": "5fe5f812abe77021408f8fc0"
}


Functionality: view thier shcedule
Route: http://localhost:5000/api/academic-schedule
Request type: get
Parameters: 
Response : array of slots that are assigned to this member

Functionality: send replacement requests
Route: http://localhost:5000/api/academic-replacement
Request type: post
Parameters: {
"slot": "5fe61b2b2404cb16bcbcfc57",
"receiver_staff_id":"ac-1"
}
Response : slot replacement request details

Functionality: view repalcement requests
Route: http://localhost:5000/api/academic-replacement
Request type: get
Parameters: get array of all linked replacement requests
Response : slot replacement requestes
[
    {
        "status": "Pending",
        "_id": "5fe625df33747c2af0155b9e",
        "slot": "5fe61b2b2404cb16bcbcfc57",
        "receiver_staff_id": "ac-1",
        "requester_staff_id": "ac-4",
        "__v": 0
    },
    {
        "status": "Pending",
        "_id": "5fe6262133747c2af0155b9f",
        "slot": "5fe61b2b2404cb16bcbcfc57",
        "receiver_staff_id": "ac-4",
        "requester_staff_id": "ac-4",
        "__v": 0
    }
]

Functionality: accept replacement requests
Route: http://localhost:5000/api/academic-replacement-accept
Request type: post
Parameters: {
"request_id": "5fe625df33747c2af0155b9e"
}
Response : request details

Functionality: send slot linking request
Route: http://localhost:5000/api/academic-slot-linking
Request type: post
Parameters: {
"course": "5fe5f8f9abe77021408f8fc2",
"slot":"5fe61b2b2404cb16bcbcfc57"
}
Response : request details 

Functionality: change dayoff request
Route: http://localhost:5000/api/academic-change-dayoff
Request type: post
Parameters: {
"new_day_off": 5
}
Response : request details

Functionality: submit leave request
Route: http://localhost:5000/api/academic-leave
Request type: post
Parameters: {
"leave_day": 5,
"leave_type": "Sick",
"response_reason":"kda"
}
Response : request details

Functionality: view all submitted requestes
Route: http://localhost:5000/api/academic-requests
Request type: get
Parameters: 
Response : array of all leaves (leave requestes,change day_off requestes,slot linking,replacement requestes)
  "leave requests": [
        {
            "status": "Pending",
            "_id": "5fe628d933747c2af0155ba1",
            "leave_day": "1970-01-01T00:00:00.005Z",
            "leave_type": "Sick",
            "staff_id": "ac-4",
            "department": "5fe5f812abe77021408f8fc0",
            "__v": 0
        },

Functionality: cancel  academic request
Route: http://localhost:5000/api/academic-cancel-request
Request type: delete
Parameters: {
"request_id":"5fe625df33747c2af0155b9e"
}
Response : type of the request and if success or err message



