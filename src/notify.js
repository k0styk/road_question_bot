const pm2 = require('pm2');
const db = require('./database/dbConnector');

// SETTINGS
const SECOND = 1000;
const MINUTE = SECOND*60;
const HOUR = MINUTE*60;
const DAY = HOUR*24; 
const intervalTime = HOUR;
const deleteUserTime = DAY;
const timeToRemind = 12;
//

let studentsToNotify = [];
let instructorsToNotify = [];
let groupsToNotify = [];
let lastDay = new Date();

process.on('message', (packet) => {
  console.log('### NOTIFY ###');
  console.log(packet);

  if(packet.type == 'register:msg') {
    pm2.sendDataToProcessId(0, packet, (err, res) => { });
  }
  if(packet.type == 'broadcast:msg') {
    pm2.sendDataToProcessId(0, packet, (err, res) => { });
  }
  
});

const intervalRegisterPeoples = setInterval( () => {
  db.getAdministratorsNoVerified()
    .then(dt=> {
      for(let i=0; i< dt.length; i++) {
        if(checkRegisterDate(new Date(dt[i]["register_date"]))){
          db.deleteAdminById(dt[i]['id'])
            .then(de => console.log(de));
        }
      }
    });
  db.getTeachersNoVerified()
    .then(dt=> {
      for(let i=0; i< dt.length; i++) {
        if(checkRegisterDate(new Date(dt[i]["register_date"]))){
          db.deleteTeacherById(dt[i]['id'])
            .then(de => console.log(de));
        }
      }
    });
  db.getStudentsNoVerified()
    .then(dt=> {
      for(let i=0; i< dt.length; i++) {
        if(checkRegisterDate(new Date(dt[i]["register_date"]))){
          db.deleteStudentById(dt[i]['id'])
            .then(de => console.log(de));
        }
      }
    });
}, deleteUserTime);

const intervalNotification = setInterval(() => {
  const today = new Date();

  if (today.getHours() == timeToRemind) {
    if (studentsToNotify.length) {
      const arr = studentsToNotify.splice(0, studentsToNotify.length);
      const data = {
        type: 'notify:msg',
        data: {
          vk_id: null,
          date: null
        },
        topic: 'Notify students'
      }

      for (let i = 0, len = arr.length; i < len; i++) {
        data.data.vk_id = arr[i]['vk_id'];
        data.data.date = arr[i].date;

        pm2.sendDataToProcessId(0, data, (err, res) => { });
      }
    }
    if (groupsToNotify.length) {
      const arr = groupsToNotify.splice(0, groupsToNotify.length);
      const data = {
        type: 'notify:msg',
        data: {
          vk_id: null,
          date: null
        },
        topic: 'Notify groups'
      }

      for (let i = 0, len = arr.length; i < len; i++) {
        data.data.vk_id = arr[i]['vk_id'];
        data.data.date = arr[i].date;

        pm2.sendDataToProcessId(0, data, (err, res) => { });
      }
    }
    if (instructorsToNotify.length) {
      const arr = instructorsToNotify.splice(0, instructorsToNotify.length);
      const data = {
        type: 'notify:msg',
        data: {
          vk_id: null,
          date: null
        },
        topic: 'Notify students'
      }

      for (let i = 0, len = arr.length; i < len; i++) {
        data.data.vk_id = arr[i]['vk_id'];
        data.data.date = arr[i].date;

        pm2.sendDataToProcessId(0, data, (err, res) => { });
      }
    }
  }
  if (today.getDay() != lastDay.getDay()) {
    const day1 = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const day2 = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 0, 0, 0);
    
    lastDay = today;
    db.getScheduleStudents(day1,day2)
      .then(dt => {
        for (let i = 0, len = dt.length; i < len; i++) {
          studentsToNotify.push(dt[i]);
        }
      })
      .catch(er => console.error(er));
    db.getScheduleInstructors(day1,day2)
      .then(dt => {
        for (let i = 0, len = dt.length; i < len; i++) {
          instructorsToNotify.push(dt[i]);
        }
      })
      .catch(er => console.error(er));
    db.getScheduleGroup(day1,day2)
      .then(dt => {
        const { students, instructors } = dt;
        for (let i = 0, len = students.length; i < len; i++) {
          groupsToNotify.push(students[i]);
        }
        for (let i = 0, len = instructors.length; i < len; i++) {
          groupsToNotify.push(instructors[i]);
        }
      })
      .catch(er => console.error(er));
  } else { }
}, intervalTime);

function checkRegisterDate(data) {
  const deleteDay = new Date(new Date().getTime()-deleteUserTime);
  const registerDate = new Date(data.getFullYear(), 
    data.getMonth(), data.getDate(), deleteDay.getHours(), 
    deleteDay.getMinutes(), deleteDay.getSeconds(), deleteDay.getMilliseconds());
  if(registerDate.getTime() < deleteDay.getTime()) {
    return true;
  }
  return false;
}