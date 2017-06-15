const http = require('http');

const TelegramBot = require('node-telegram-bot-api');
const token = '395513821:AAGE0sV5CA_gIYAyCu-ZWc8hSbeMNnNMiK4';
const bot = new TelegramBot(token, {polling: true});

const options = {
    host: "api.blockcypher.com",
    path: "/v1/eth/main/addrs/",
    address: ""
};

bot.onText(/(.+)/, function(msg, match){
    const chat = msg.chat.id;
    console.log(msg);
    bot.sendMessage(chat, 'wtf?');
});

