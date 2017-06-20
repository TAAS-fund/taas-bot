const request = require('request');
const config = require('config');

const blockcypherAPI = config.get('BlockCypherAPI');
const confirmation = config.get('AddressConfirmation');

const TelegramBot = require('node-telegram-bot-api');
const token = config.get('Telegram-bot.token');
const bot = new TelegramBot(token, {polling: true});

//Standart TaaS-Bot messages
const messages = config.get('Bot-messages');

//To greet new user
bot.onText(/([/]start)/, function(msg, match){
    const chat = msg.chat.id;
    bot.sendMessage(chat, messages.greetings);
});

//To create new subscription
bot.onText(/([/]create)/, function(msg, match){
    const chat = msg.chat.id;
    bot.sendMessage(chat, messages.newFollow.start);
    
    bot.onText(/(.{40})/, function(msg, match){
        const address = match[0];

        //TODO: Check `address` for responce
        request(blockcypherAPI.host + blockcypherAPI.path + address, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                bot.sendMessage(chat, "Yey! Address exists, " + messages.newFollow.name);
                //TODO: Save data to db
            }
        });
        bot.onText(/([a-z, A-Z]{1,10})/,function (msg, match){
            const name = match[0];
            
            bot.sendMessage(chat, name + ": " + address);
            bot.sendMessage(chat, messages.newFollow.congrats);
        });
    });
});


