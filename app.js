const request = require('request');
const pool = require('./db/database');

pool.connect(function (err, client, done) {
    if(err){
        return console.error('error fetching client from pool', err);
    }

    client.query()
});

const TelegramBot = require('node-telegram-bot-api');
const token = '395513821:AAGE0sV5CA_gIYAyCu-ZWc8hSbeMNnNMiK4';
const bot = new TelegramBot(token, {polling: true});

//API requests options
const options = {
    host: "api.blockcypher.com",
    path: "/v1/eth/main/addrs/",
    address: ""
};

//Standart TaaS-Bot messages
const messages = {
    greetings: "Hi there!",
    newFollow: {
        start: "Enter adress",
        name: "Enter name",
        error: "Please try again",
        congrats: "Congrats"
    },
    delete: "Choose what you whant tot delete",
    done: "Done!"
};

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