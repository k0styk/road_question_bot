const config = require('./../config/config.js');
const VkBot = require('node-vk-bot-api');
const Scenes = require('./scenes/scenes');
const scenes = new Scenes();
const Session = require('node-vk-bot-api/lib/session');
const Markup = require('node-vk-bot-api/lib/markup');

const bot = new VkBot(config.getValue('token'));

const session = new Session();
bot.use(session.middleware());
bot.use(scenes.registerStage.middleware());

bot.command('/start', (ctx) => {
  log("Start command");
  ctx.reply(`Здравствуйте!\n
    Я виртуальный помощник группы. Буду помогать вам взаимодействовать с нашим сервисом.\n
    Укажите, пожалуйста, какое действие вам необходимо?\n
    1. Регистрация автошколы\n2. Регистрация пользователя автошколы\n3. Другое(вопрос по ПДД)`, null, Markup.keyboard(
      [
        Markup.button('Автошкола','default', { startData: 1}),
        Markup.button('Пользователь','primary', { startData: 2}),
        Markup.button('Другое','default', { startData: 3})
      ]
    )
    .oneTime())
});

bot.command('/register', (ctx) => {
  ctx.scene.enter('registerUser');
});

bot.on((ctx) => {
  log(" \"on\" event");
  if(ctx.message.payload) {
    const payload = JSON.parse(ctx.message.payload);
    console.log(payload);
  } 
})

function log(message) {
  console.log(new Date().toLocaleTimeString()+": "+message);
}

bot.startPolling();
log("Bot started");

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
