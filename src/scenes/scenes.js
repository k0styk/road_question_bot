const Stage = require('node-vk-bot-api/lib/stage');
const registerUser = require('./registerUser');
const registerSchool = require('./registerSchool');

class Scenes {
  
  constructor() {
      this.stages = null;
    } 
};

let myScenes = new Scenes();
myScenes.stages = new Stage(registerUser, registerSchool);

module.exports = myScenes;
