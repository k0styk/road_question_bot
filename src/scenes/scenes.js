const Stage = require('node-vk-bot-api/lib/stage');
const registerUser = require('./registerUser');
const registerSchool = require('./registerSchool');

class Scenes {
  
  constructor() {
      this.registerUserStage = null;
      this.registerSchoolStage = null;

    } 
};

let myScenes = new Scenes();
myScenes.registerUserStage = new Stage(registerUser);
// myScenes.registerSchoolStage = new Stage(registerSchool);

module.exports = myScenes;
