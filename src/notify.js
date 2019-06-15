const pm2 = require('pm2');
const db = require('./database/dbConnector');

// SETTINGS
const SECOND = 1000;
const MINUTE = SECOND*60;
const HOUR = MINUTE*60;
const DAY = HOUR*24; 
const intervalTime = HOUR;
const deleteUserTime = DAY;
//

process.on('message', (packet) => {
  console.log('### NOTIFY ###');
  console.log(packet);

  if(packet.type == 'register:msg') {
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
}, intervalTime);

const intervalNotification = setInterval( ()=> {
  

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