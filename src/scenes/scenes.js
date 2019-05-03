const VkBot = require('node-vk-bot-api/lib');
const Stage = require('node-vk-bot-api/lib/stage');
const Scene = require('node-vk-bot-api/lib/scene');
const Markup = require('node-vk-bot-api/lib/markup');

class Scenes {
  
  constructor() {
      this.register = new Scene('register',
        (ctx) => {
          ctx.scene.next();
          ctx.reply('Для регистрации нам необходимы данные о вас:\nВы являетесь учеником или сотрудником?', null, Markup
          .keyboard(
            [
              Markup.button('Ученик','primary', { user: 'student'}),
              Markup.button('Сотрудник','default', {user: 'staff'})
            ]
          )
          .oneTime());
        },
        (ctx) => {
          const payload = JSON.parse(ctx.message.payload);
          ctx.session.isStudent = payload.user == 'student' ? true : false;
          ctx.scene.next();
          ctx.reply('What is your name?');
        },
        (ctx) => {
          ctx.session.name = ctx.message.text;
          console.log(ctx.session.isStudent);
          console.log(ctx.scene.step);
          ctx.scene.leave();
          ctx.reply(`Nice to meet you, ${ctx.session.name} (${ctx.session.age} years old)`);
        });

      this.welcome = new Scene('welcome', 
      (ctx) => {
        // TODO проверка зарегистрирован ли пользователь

      });

      
      this.registerStage = new Stage(this.register);
    } 
};

//^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$

module.exports = Scenes;
