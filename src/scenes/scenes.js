const VkBot = require('node-vk-bot-api/lib');
const Session = require('node-vk-bot-api/lib/session');
const Stage = require('node-vk-bot-api/lib/stage');
const Scene = require('node-vk-bot-api/lib/scene');

// const scenes = [];

class scenes {
  
  constructor() {
    this.meet = new Scene('meet',
        (ctx) => {
          ctx.scene.next();
          ctx.reply('How old are you?');
        },
        (ctx) => {
          ctx.session.age = +ctx.message.text;
  
          ctx.scene.next();
          ctx.reply('What is your name?');
        },
        (ctx) => {
          ctx.session.name = ctx.message.text;
  
          ctx.scene.leave();
          ctx.reply(`Nice to meet you, ${ctx.session.name} (${ctx.session.age} years old)`);
        });
      this.meetStage = new Stage(this.meet);
    } 
};

// const session = new Session();
// const scene = new Scene('meet',
//   (ctx) => {
//     ctx.scene.next();
//     ctx.reply('How old are you?');
//   },
//   (ctx) => {
//     ctx.session.age = +ctx.message.text;

//     ctx.scene.next();
//     ctx.reply('What is your name?');
//   },
//   (ctx) => {
//     ctx.session.name = ctx.message.text;

//     ctx.scene.leave();
//     ctx.reply(`Nice to meet you, ${ctx.session.name} (${ctx.session.age} years old)`);
//   });
// const stage = new Stage(scene);

// scenes.push({
//   scene: scene,
//   stage: stage,
//   session: session
// });

module.exports = scenes;