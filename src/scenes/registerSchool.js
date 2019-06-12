const Scene = require('node-vk-bot-api/lib/scene');
const Markup = require('node-vk-bot-api/lib/markup');

const registerSchool = new Scene('registerSchool',
(ctx) => {  // 0
  ctx.scene.next();
  ctx.reply('Для регистрации нам необходимы данные о вас:\nВы являетесь учеником или сотрудником?',
    null, Markup.keyboard(
      [
        Markup.button('Ученик', 'primary', { user: 'student' }),
        Markup.button('Сотрудник', 'default', { user: 'staff' })
      ]
    )
      .oneTime());
},
(ctx) => {  // 1
  const payload = JSON.parse(ctx.message.payload);
  ctx.session.isStudent = payload.user == 'student' ? true : false;
  ctx.scene.next();
  db.getListRoadSchools()
    .then(dt => {
      ctx.session.schoolIds = dt.map(val => val.id);
      ctx.reply(`Отлично!\nВведите номер вашей автошколы из списка:\n${dt.map((val, index) => {
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
      ctx.reply(`Осталось немного :)\nВведите номер вашей группы из списка:\n${dt.map((val, index) => {
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
      alert: ctx.session.isStudent ? 'teacher' : 'admin',
      group: ctx.session.group,
      school: ctx.session.school,
      user: ctx.message.from_id,
    },
    topic: 'Register user'
  }, (err, res) => {
  });

  // Send Data to DB
  if (ctx.session.isStudent) {
    db.registerStudentSchool({
      group_id: ctx.session.group,
      vk_id: ctx.message.from_id
    });
  } else {
    db.registerTeacherSchool({
      group_id: ctx.session.group,
      vk_id: ctx.message.from_id
    });
  }
  ctx.scene.next();
  ctx.reply(`Спасибо, теперь нам необходимо передать информацию администратору вашей автошколы,
          после подтверждения информации вы получите доступ к функциям.\n
          Об изменении статуса я вам сообщу :)`);
  ctx.reply(`Пока есть время, продолжим заполнение анкеты :)
    Укажите, пожалуйста, ваше ФИО(через пробел).
    Пример: Иванов Иван Иванович`);
},
(ctx) => {  // 4
  ctx.session.name = ctx.message.text;
  ctx.scene.next();
  if (ctx.session.isStudent) {
    db.updateStudentSchool(ctx.message.from_id, {
      Name: ctx.session.name
    });
    ctx.reply(`Последний пункт!
    Ваш номер телефона - это необходимо для срочной связи руководства с вами.`);
  } else {
    db.updateTeacherSchool(ctx.message.from_id, {
      Name: ctx.session.name
    });
    ctx.reply(`Ваш номер телефона - это необходимо для срочной связи руководства с вами.`);
  }

},
(ctx) => {  // 5
  ctx.session.phone = ctx.message.text;
  if (ctx.session.isStudent) {
    ctx.scene.leave();
    db.updateStudentSchool(ctx.message.from_id, {
      phone: ctx.session.phone
    });
    ctx.reply(`Спасибо за информацию!`);
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
  ctx.reply(`Спасибо за информацию!`);
}
);

module.exports = registerSchool;