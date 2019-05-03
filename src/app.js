const config = require('./../config/config.js');
const VkBot = require('node-vk-bot-api');
const Scenes = require('./scenes/scenes');
const scenes = new Scenes();
const Session = require('node-vk-bot-api/lib/session');

const bot = new VkBot(config.getValue('token'));

const session = new Session();
bot.use(session.middleware());
bot.use(scenes.registerStage.middleware());

bot.command('/start', (ctx) => {
  ctx.reply('Hello!')
  log("Start command");
});

bot.command('/register', (ctx) => {
  ctx.scene.enter('register');
});

bot.on((ctx) => {
  ctx.reply("I want some command");
  log("On event");
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
