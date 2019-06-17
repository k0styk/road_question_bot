const Scene = require('node-vk-bot-api/lib/scene');
const db = require('../database/dbConnector');
const pm2 = require('pm2');
const {
  SEND_REPLY_TEXT
} = require('../constants/constants');

const sendStudent = new Scene('sendStudent',
  (ctx) => {  // 0
    ctx.scene.next();
    ctx.reply(SEND_REPLY_TEXT);
  },
  (ctx) => {
    ctx.scene.leave();
    const { text } = ctx.message;

    db.getStudentsVkFromAdmin(ctx.message.from_id)
      .then(dt => {
        for (let i = 0, len = dt.length; i < len; i++) {
          pm2.sendDataToProcessId(1, {
            type: 'broadcast:msg',
            data: {
              vk_id: dt[i].vk_id,
              Name: dt[i].Name,
              msg: text
            },
            topic: 'Student'
          }, (err, res) => { });
        }
        ctx.reply('Отправлено');
      })
      .catch(er => console.error(er));
  }
);

module.exports = sendStudent;