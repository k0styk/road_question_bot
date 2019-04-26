const config = require('./../config/config.js');
const VkBot = require('node-vk-bot-api');

const bot = new VkBot(config.getValue('token'));

bot.command('/start', (ctx) => {
  ctx.reply('Hello!')
});

bot.startPolling();
