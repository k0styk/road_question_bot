const Stage = require('node-vk-bot-api/lib/stage');
const registerUser = require('./registerUser');
const registerSchool = require('./registerSchool');
const downloadSchedule = require('./downloadSchedule');
const sendInstructors = require('./sendInstructors');
const sendStudents = require('./sendStudents');

class Scenes {
  constructor() {
      this.stages = null;
    } 
};

let myScenes = new Scenes();
myScenes.stages = new Stage(registerUser, 
  registerSchool, 
  downloadSchedule,
  sendInstructors,
  sendStudents
);

module.exports = myScenes;
