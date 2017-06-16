const request = require('request');
const pool = require('./db/database');
const getConfig = require('config');

pool.connect(function (err, client, done) {
    if(err){
        return console.error('error fetching client from pool', err);
    }

    client.query()
});

const TelegramBot = require('node-telegram-bot-api');
const token = getConfig.get('User.Telegram-bot.token');
const bot = new TelegramBot(token, {polling: true});

//API requests options
const options = {
    host: "api.blockcypher.com",
    path: "/v1/eth/main/addrs/",
    address: ""
};

//Standart TaaS-Bot messages
const messages = getConfig.get('User.Bot-messages');

//To greet new user
bot.onText(/([/]start)/, function(msg, match){
    const chat = msg.chat.id;
    bot.sendMessage(chat, messages.greetings);
});

//To create new subscription
bot.onText(/([/]create)/, function(msg, match){
        const chat = msg.chat.id;
        bot.sendMessage(chat, messages.newFollow.start);
    
    bot.onText(/([\w]{42})/, function(msg, match){
        const chat = msg.chat.id;
        let address = match;
    });
});


function deleteFollow(){

}