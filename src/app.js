const config = require('./../config/config.js');
const VkBot = require('node-vk-bot-api');
const scenes = require('./scenes/scenes');
const Session = require('node-vk-bot-api/lib/session');
const Markup = require('node-vk-bot-api/lib/markup');
const bot = new VkBot(config.getValue('token'));
const session = new Session();
const db = require('./database/dbConnector');

const {
  WELCOME,
  VK_LINK,
  MESSAGE_ADMINISTRATOR,
  CONGRATS,
  SOSORRY,
  MENUS,
  NOTIFY_STUDENT_MSG,
  NOTIFY_GROUP_MSG,
  NOTIFY_INSTRUCTOR_MSG
} = require('./constants/constants');

bot.use(session.middleware());
bot.use(scenes.stages.middleware());

bot.command('/test', (ctx) => {
  log("test command");
  try {
    db.getTeachersSchool(1)
      .then(dt => {
        console.log(dt);
      });
  }
  catch (err) {
    console.error(err);
  }
});

// // .sendMessage(userId, message, attachment, keyboard, sticker)
// // Simple usage
// bot.sendMessage(145003487, 'Hello!', 'photo1_1')

bot.on((ctx) => {
  log(" \"on\" event");
  if (ctx.message.payload) {
    const payload = JSON.parse(ctx.message.payload);
    if (payload.command) {
      if (payload.command == 'start') {
        ctx.reply(WELCOME, null, Markup.keyboard(
          [
            Markup.button('Пользователь', 'primary', { startData: 2 }),
            Markup.button('Автошкола', 'default', { startData: 1 }),
            Markup.button('Другое', 'default', { startData: 3 })
          ], {columns: 2}).oneTime())
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
    if (payload.registerStudent) {
      if (payload.registerStudent === 'ok') {
        db.updateStudentSchool(payload.id, { verified: true })
          .then(dt => {
            bot.sendMessage(payload.id, CONGRATS);
            sendStudentMenu(payload.id);
          });
      } else {
        sendSorryStartMenu(payload.id);
      }
    }
    if (payload.registerTeacher) {
      if (payload.registerTeacher === 'ok') {
        db.updateTeacherSchool(payload.id, { verified: true })
          .then(dt => {
            bot.sendMessage(payload.id, CONGRATS);
            sendTeacherMenu(payload.id);
          });
      } else {
        sendSorryStartMenu(payload.id);
      }
    }
    if(payload.registerAdmin) {
      if (payload.registerAdmin === 'ok') {
        db.updateAdministrator(payload.id, { verified: true })
          .then(dt => {
            bot.sendMessage(payload.id, CONGRATS);
            sendAdministratorMenu(payload.id);
          });
      } else {
        sendSorryStartMenu(payload.id);
      }
    }
    if(payload.changeNotification) {
      const { notification, role } = payload.changeNotification;

      if (role === 'students') {
        db.updateNotificationTableByVkId(role, ctx.message.from_id, notification)
          .then(dt => {
            ctx.reply('Изменено');
            sendStudentMenu(ctx.message.from_id);
          });
      } else if (role === 'instructors') {
        console.log('## THERE ###');
        db.updateNotificationTableByVkId(role, ctx.message.from_id, notification)
          .then(dt => {
            ctx.reply('Изменено');
            sendTeacherMenu(ctx.message.from_id);
          });
      } else if (role === 'administrators') {
        db.updateNotificationTableByVkId(role, ctx.message.from_id, notification)
          .then(dt => {
            ctx.reply('Изменено');
            sendAdministratorMenu(ctx.message.from_id);
          });
      }
    }
    if(payload.adminMenu) {
      console.dir(ctx.scene);
      const { load, send } = payload.adminMenu;
      if(load) {
        ctx.scene.enter('downloadSchedule');        
      } else {
        if(send === 'students') {
          ctx.scene.enter('sendStudents');
        }
        if (send === 'instructors') {
          ctx.scene.enter('sendInstructors');
        }
      }
    }
  } else {
    //sendSorryStartMenu(ctx.message.from_id);
  }
});

bot.startPolling(()=> {
  log("Bot started");
});

process.on('message', (packet) => {
  console.log('### APP ###');
  console.log(packet);

  if (packet.type === 'register:msg') {
    const {data} = packet;

    if (data.alert === 'student') {
      db.getTeachersSchool(data.group)
        .then(dt => {
          console.log(dt);
          for (let i = 0; i < dt.length; i++) {
            let vk = dt[i]['vk_id'];
            let link = VK_LINK + data.user;
            const payloadOk = { registerStudent: 'ok', id: data.user };
            const payloadNo = { registerStudent: 'no', id: data.user };
            bot.sendMessage(vk, MESSAGE_ADMINISTRATOR + link, null, Markup.keyboard(
              [
                Markup.button('OK', 'positive', payloadOk),
                Markup.button('НЕТ', 'negative', payloadNo),
              ]
            ).oneTime())
          }
        });
    } else if(data.alert === 'teacher') {
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
            ).oneTime());
          }
        })
        .catch(err => console.error(err));
    } else if(data.alert === 'admin') {
      const payloadOk = { registerAdmin: 'ok', id: data.user };
      const payloadNo = { registerAdmin: 'no', id: data.user };
      if(data.new) {
        const admins = config.getValue('administrators');
        
        for (let i = 0, len = admins.length; i < len; i++) {
          let vk = admins[i];
          let link = VK_LINK + data.user;
          bot.sendMessage(vk, MESSAGE_ADMINISTRATOR + link, null, Markup.keyboard(
            [
              Markup.button('OK', 'positive', payloadOk),
              Markup.button('НЕТ', 'negative', payloadNo),
            ]
          ).oneTime());
        }
      } else {
        db.getAdministratorsSchool(data.schoolId)
        .then(dt => {
          for (let i = 0, len = dt.length; i < len; i++) {
            let vk = dt[i]['vk_id'];
            let link = VK_LINK + data.user;
            bot.sendMessage(vk, MESSAGE_ADMINISTRATOR + link, null, Markup.keyboard(
              [
                Markup.button('OK', 'positive', payloadOk),
                Markup.button('НЕТ', 'negative', payloadNo),
              ]
            ).oneTime());
          }
        }).catch(err => console.error(err));
      }
    }

  }
  if (packet.type === 'broadcast:msg') {
    const { data } = packet;

    bot.sendMessage(data.vk_id, `${data.Name}!\n${data.msg}`);
  }
  if (packet.type === 'notify:msg') {
    const { data } = packet;
    if(packet.topic === 'Notify students') {
      // bot.sendMessage(data.vk_id, `${NOTIFY_STUDENT_MSG} ${data.date}`);
    } else if(packet.topic === 'Notify instructors') {
      // bot.sendMessage(data.vk_id, `${NOTIFY_INSTRUCTOR_MSG} ${data.date}`);
    } else if(packet.topic === 'Notify groups') {
      console.log(data);
      // bot.sendMessage(data.vk_id, `${NOTIFY_GROUP_MSG} ${data.date}`);
    }
  }
});

function sendSorryStartMenu(vk) {
  bot.sendMessage(vk, `${SOSORRY}\nНо вы можете попробовать ещё раз!`, null, Markup.keyboard(
    [
      Markup.button('Пользователь', 'primary', { startData: 2 }),
      Markup.button('Автошкола', 'default', { startData: 1 }),
      Markup.button('Другое', 'default', { startData: 3 })
    ]).oneTime()
  );
}

function sendStudentMenu(vk) {
  db.getNotificationFromTableByVkId('students',vk)
  .then(dt => {
    const { notification } = dt[0];
    const notifyText = (notification? 'Выкл. ' : 'Вкл. ') + 'уведомления';
    
    bot.sendMessage(vk, `Вы можете задать вопрос или воспользоваться меню\n`, null, Markup.keyboard(
      [
        Markup.button(notifyText, 'default', { changeNotification: { notification: !notification, role: 'students' }}),
        Markup.button('Посмотреть расписание', 'default', { schedule: 'hz' })
      ], {columns: 1})
    );
  });
  
}

function sendTeacherMenu(vk) {
  db.getNotificationFromTableByVkId('instructors',vk)
  .then(dt => {
    const { notification } = dt[0];
    const notifyText = (notification? 'Выкл. ' : 'Вкл. ') + 'уведомления';
    
    bot.sendMessage(vk, MENUS, null, Markup.keyboard(
      [
        Markup.button(notifyText, 'default', { changeNotification: { notification: !notification, role: 'instructors' }}),
        Markup.button('Посмотреть расписание', 'default', { schedule: 'hz' })
      ], {columns: 1})
    );
  });
}

function sendAdministratorMenu(vk) {
  bot.sendMessage(vk, MENUS, null, Markup.keyboard(
    [
      Markup.button('Рассылка учителям', 'default', { adminMenu: { send: 'instructors' }}),
      Markup.button('Рассылка студентам', 'default', { adminMenu: { send: 'students' }}),
      Markup.button('Загрзить расписание', 'default', { adminMenu: { load: 'schedule' }}),
    ], {columns: 1})
  );
}

function log(message) {
  console.log(new Date().toLocaleTimeString() + ": " + message);
}