const Scene = require('node-vk-bot-api/lib/scene');
const Markup = require('node-vk-bot-api/lib/markup');
const db = require('../database/dbConnector');
const pm2 = require('pm2');
const {
  THANKYOU,
  REGISTER_SCHOOL,
  INFO_TO_ADMIN,
  SAY_SCHOOL_INFO,
  SAY_ADMINISTRATOR_INFO
} = require('../constants/constants');

const registerSchool = new Scene('registerSchool',
  (ctx) => {  // 0
    ctx.session.schoolId = -1;
    ctx.scene.next();
    db.getListRoadSchools()
      .then(dt => {
        ctx.session.schoolIds = dt.map(val => val.id);
        ctx.reply(`${REGISTER_SCHOOL}${dt.map((val, index) => {
          return `${index + 1}. Школа: ${val.Name} - ${val.City}`
        }).join('\n')}`, null, Markup.keyboard(
          [
            Markup.button('нет', 'negative', { no: true }),
          ]
        ).oneTime());
      });
  },
  (ctx) => {  // 1
    let msg ='';
    let data = {};
    if(ctx.message.payload) {
      // Создаем пользователя и школу
      data = {
        alert: 'admin',
        user: ctx.message.from_id,
        new: true
      };
      msg = `\n${SAY_SCHOOL_INFO}`;
    } else {
      // Создаем пользователя
      ctx.session.schoolId = ctx.session.schoolIds[parseInt(ctx.message.text)-1];
      ctx.scene.step = 2;
      msg = '\n'+SAY_ADMINISTRATOR_INFO;
      data = {
        alert: 'admin',
        user: ctx.message.from_id,
        schoolId: ctx.session.schoolIds[parseInt(ctx.message.text)-1],
        new: false
      };
    }
    pm2.sendDataToProcessId(1, {
      type: 'register:msg',
      data: data,
      topic: 'Register administrator'
    }, (err, res) => { });
    db.registerAdministrator({
      vk_id: ctx.message.from_id,
      register_date: new Date().toISOString(),
      verified: false,
      notification: false
    });
    ctx.scene.next();
    ctx.reply(`${INFO_TO_ADMIN}\n${msg}`);
  },
  (ctx) => {  // 2
    const [ name, city, address] = ctx.message.text.split(',');
    
    db.registerSchool({
      Name: name,
      City: city,
      Address: address
    }).then(dt => {
      ctx.session.schoolId = parseInt(dt[0]);
      ctx.scene.next();
      ctx.reply(SAY_ADMINISTRATOR_INFO);
    });
  },
  (ctx) => {  // 3
    const [ fio, phone] = ctx.message.text.split(',');

    db.updateAdministrator({
      school_id: ctx.session.schoolId > 0 ? ctx.session.schoolId : null,
      Name: fio,
      phone: phone
    });
    ctx.scene.leave();
    ctx.reply(THANKYOU);
  }
);

module.exports = registerSchool;