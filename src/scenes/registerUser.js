const Scene = require('node-vk-bot-api/lib/scene');
const Markup = require('node-vk-bot-api/lib/markup');
const db = require('../database/dbConnector');

const registerUser = new Scene('registerUser',
        (ctx) => {  // 0
          ctx.scene.next();
          ctx.reply('Для регистрации нам необходимы данные о вас:\nВы являетесь учеником или сотрудником?', 
          null, Markup.keyboard(
            [
              Markup.button('Ученик','primary', { user: 'student'}),
              Markup.button('Сотрудник','default', {user: 'staff'})
            ]
          )
          .oneTime());
        },
        (ctx) => {  // 1
          const payload = JSON.parse(ctx.message.payload);
          ctx.session.isStudent = payload.user == 'student' ? true : false;
          console.log(payload);
          if(ctx.session.isStudent) {
            ctx.scene.step = 3; // FIX
          }
          ctx.scene.next();
          console.log("nextScene");
          // db.getListRoadSchools()
          //   .then(data => {
          //     console.log(data);
          //   })
          //   .catch(err => {
          //     console.error(err);
          //   });
          ctx.reply('Отлично!\nВведите номер вашей автошколы из списка:\n');
        },
        (ctx) => {  // 2
          ctx.session.school = ctx.message.text;
          ctx.scene.leave();
          ctx.reply(`Спасибо, теперь нам необходимо передать информацию администратору вашей автошколы,
            после подтверждения информации вы получите доступ к функциям.\n
            Об изменении статуса мы вам сообщим.`);
        },
        (ctx) => {  // 3
          console.log(ctx.scene.step);
          ctx.scene.leave();
          ctx.reply('MEOW');
        },
        (ctx) => {  // 4
          
        }
);

module.exports = registerUser;
