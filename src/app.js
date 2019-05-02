const config = require('./../config/config.js');
const VkBot = require('node-vk-bot-api');

const bot = new VkBot(config.getValue('token'));

bot.command('/start', (ctx) => {
  ctx.reply('Hello!')
  log("Start command");
});

bot.on((ctx) => {
  ctx.reply("I want some command");
  log("On event");
})

bot.startPolling();
log("Bot started");

function log(message) {
  console.log(new Date().toLocaleTimeString()+": "+message);
}

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
