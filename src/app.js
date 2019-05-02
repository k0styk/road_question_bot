const config = require('./../config/config.js');
const VkBot = require('node-vk-bot-api');
const scenes = require('./scenes/scenes');

const bot = new VkBot(config.getValue('token'));

console.log(scenes);
//bot.use(session.middleware());
//bot.use(stage.middleware());

// bot.command('/meet', (ctx) => {
//   ctx.scene.enter('meet');
// });

// bot.command('/start', (ctx) => {
//   ctx.reply('Hello!')
// });

// bot.startPolling();
