const VkBot = require('node-vk-bot-api/lib');
const Stage = require('node-vk-bot-api/lib/stage');
const Scene = require('node-vk-bot-api/lib/scene');
const Markup = require('node-vk-bot-api/lib/markup');
const pg = require();
const register = require('./register');

class Scenes {
  
  constructor() {
      // register user
      this.registerUser = null;

      // this.welcome = new Scene('welcome', 
      // (ctx) => {
      //   // TODO проверка зарегистрирован ли пользователь

      // });

      
      this.registerStage = new Stage(register);
    } 
};

//^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$

module.exports = Scenes;
