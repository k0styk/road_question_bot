const config = require('./../config/config.js');
const VkBot = require('node-vk-bot-api');
const scenes = require('./scenes/scenes');
const Session = require('node-vk-bot-api/lib/session');
const Markup = require('node-vk-bot-api/lib/markup');
const pm2 = require('pm2');
const bot = new VkBot(config.getValue('token'));
const session = new Session();
const db = require('./database/dbConnector');
const { WELCOME, VK_LINK, MESSAGE_ADMINISTRATOR } = require('./constants/constants');

bot.use(session.middleware());
bot.use(scenes.stages.middleware());

bot.command('/test', (ctx) => {
  log("test command");
  try {
    ctx.scene.enter('registerUser');
  }
  catch (err) {
    console.error(err);
  }
});

// .sendMessage(userId, message, attachment, keyboard, sticker)
// // Simple usage
// bot.sendMessage(145003487, 'Hello!', 'photo1_1')

bot.on((ctx) => {
  log(" \"on\" event");
  console.log(ctx);
  if (ctx.message.payload) {
    const payload = JSON.parse(ctx.message.payload);
    if (payload.command) {
      if (payload.command == 'start') {
        log("Start command");
        ctx.reply(WELCOME, null, Markup.keyboard(
          [
            Markup.button('Пользователь', 'primary', { startData: 2 }),
            Markup.button('Автошкола', 'default', { startData: 1 }),
            Markup.button('Другое', 'default', { startData: 3 })
          ]
        ).oneTime())
      }
    }
    // First message
    if (payload.startData) {
      switch (payload.startData) {
        case 1:
          ctx.scene.enter('registerSchool');
          break;
        case 2:
          ctx.scene.enter('registerUser');
          break;
        case 3:
          // TODO FAQ
          break;
      }
    }
  } else { }
});

function log(message) {
  console.log(new Date().toLocaleTimeString() + ": " + message);
}

bot.startPolling();
log("Bot started");

process.on('message', (packet) => {
  console.log('### APP ###');
  console.log(packet);

  if(packet.type == 'register:msg') {
    const data = packet.data;

    if(data.alert == 'teacher') {
      // db.getAdministratorsSchool(data.school);
    } else {
      db.getAdministratorsSchool(data.school)
      .then(dt => {
        for (let i = 0; i < dt.length; i++) {
          let vk = dt[i]['vk_id'];
          let link = VK_LINK + data.user;
          const payloadOk = { registerTeacher: 'ok', id: data.user };
          const payloadNo = { registerTeacher: 'no', id: data.user };
          bot.sendMessage(vk, MESSAGE_ADMINISTRATOR + link, null, Markup.keyboard(
            [
              Markup.button('OK', 'positive', payloadOk),
              Markup.button('НЕТ', 'negative', payloadNo),
            ]
          ).oneTime())
        }
      })
      .catch(err => console.error(err));
    }
  }
});

// pm2.sendDataToProcessId(1, {
//   type: 'register:msg',
//   data: {
//     alert: ctx.session.isStudent? 'teacher':'admin',
//     group: ctx.session.group,
//     school: ctx.session.school,
//     user: ctx.message.from_id,
//   },
//   topic: 'Register user' }, (err, res) => { 
// });

// process.on('uncaughtException', function (err) {
//   console.log('Caught exception: ' + err);
//   throw err;
// });

// Context {
//  message:
//   { date: 1556766687,
//     from_id: 95123545,
//     id: 9,
//     out: 0,
//     peer_id: 95123545,
//     text: '/start',
//     conversation_message_id: 7,
//     fwd_messages: [],
//     important: false,
//     random_id: 0,
//     attachments: [],
//     is_hidden: false,
//     type: 'message_new' },
//
