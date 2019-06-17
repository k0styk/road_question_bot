const Scene = require('node-vk-bot-api/lib/scene');
const Markup = require('node-vk-bot-api/lib/markup');
const db = require('../database/dbConnector');
const pm2 = require('pm2');
const {
  TEACHERorSTUDENT,
  ROADSCHOOLNUMBER,
  GROUPNUMBER,
  THANKYOU,
  THANKYOU_LONG,
  HAVETIME,
  ASKPHONE
} = require('../constants/constants');

const registerUser = new Scene('registerUser',
  (ctx) => {  // 0
    ctx.scene.next();
    ctx.reply(TEACHERorSTUDENT,
      null, Markup.keyboard(
        [
          Markup.button('Ученик', 'primary', { user: 'student' }),
          Markup.button('Сотрудник', 'default', { user: 'staff' })
        ]
      ).oneTime()
    );
  },
  (ctx) => {  // 1
    const payload = JSON.parse(ctx.message.payload);
    ctx.session.isStudent = payload.user == 'student' ? true : false;
    ctx.scene.next();
    db.getListRoadSchools()
      .then(dt => {
        ctx.session.schoolIds = dt.map(val => val.id);
        ctx.reply(`${ROADSCHOOLNUMBER}${dt.map((val, index) => {
          return `${index + 1}. Школа: ${val.Name} - ${val.City}`
        }).join('\n')}`);
      });
  },
  (ctx) => {  // 2
    ctx.session.school = ctx.session.schoolIds[parseInt(ctx.message.text) - 1];
    ctx.scene.next();
    db.getListGroupsFromSchool(ctx.session.school)
      .then(dt => {
        ctx.session.groupIds = dt.map(val => val.id);
        ctx.reply(`${GROUPNUMBER}${dt.map((val, index) => {
          return `${index + 1}. Группа: ${val.Name}`
        }).join('\n')}`);
      });
  },
  (ctx) => {  // 3
    ctx.session.group = ctx.session.groupIds[parseInt(ctx.message.text) - 1];
    // Send data to Notification app
    pm2.sendDataToProcessId(1, {
      type: 'register:msg',
      data: {
        alert: ctx.session.isStudent ? 'student' : 'teacher',
        group: ctx.session.group,
        school: ctx.session.school,
        user: ctx.message.from_id,
      },
      topic: 'Register user'
    }, (err, res) => { });

    // Send Data to DB
    if (ctx.session.isStudent) {
      db.registerStudentSchool({
        group_id: ctx.session.group,
        vk_id: ctx.message.from_id,
        register_date: new Date().toISOString(),
        verified: false,
        notification: false
      });
    } else {
      db.registerTeacherSchool({
        group_id: ctx.session.group,
        vk_id: ctx.message.from_id,
        register_date: new Date().toISOString(),
        verified: false,
        notification: false
      });
    }
    ctx.scene.next();
    ctx.reply(THANKYOU_LONG);
    ctx.reply(HAVETIME);
  },
  (ctx) => {  // 4
    ctx.session.name = ctx.message.text;
    ctx.scene.next();
    if (ctx.session.isStudent) {
      db.updateStudentSchool(ctx.message.from_id, {
        Name: ctx.session.name
      });
      ctx.reply(`Последний пункт!
      ${ASKPHONE}`);
    } else {
      db.updateTeacherSchool(ctx.message.from_id, {
        Name: ctx.session.name
      });
      ctx.reply(ASKPHONE);
    }
  },
  (ctx) => {  // 5
    ctx.session.phone = ctx.message.text;
    if (ctx.session.isStudent) {
      ctx.scene.leave();
      db.updateStudentSchool(ctx.message.from_id, {
        phone: ctx.session.phone
      });
      ctx.reply(THANKYOU);
    } else {
      ctx.scene.next();
      db.updateTeacherSchool(ctx.message.from_id, {
        phone: ctx.session.phone
      });
      db.getRoles()
        .then(dt => {
          ctx.reply(`Кем вы являетесь:\n${dt.map((val) => {
            return `${val.id}. Роль: ${val.Name}`
          }).join('\n')}`);
        });
    }
  },
  (ctx) => {  // 6
    ctx.session.role = ctx.message.text;
    ctx.scene.leave();
    db.updateTeacherSchool(ctx.message.from_id, {
      role_id: ctx.session.role
    });
    ctx.reply(THANKYOU);
  }
);

module.exports = registerUser;