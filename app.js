const request = require('request');
const config = require('config');

const TelegramBot = require('node-telegram-bot-api');
const token = config.get('Telegram-bot.token');
const bot = new TelegramBot(token, { polling:true });

const commands = config.get('commands');
const botDialog = config.get('Bot-messages');

const commandList = {
    start: createRegExp(commands.start),
    create: createRegExp(commands.create),
    delete: createRegExp(commands.delete)
};

//TODO: Create session for user

//

//Converting any string to RegExp
function createRegExp(arg) {
    return new RegExp(arg);
}

//Testing section

bot.on('message', function(msg){
    const chat = msg.chat.id;
    const user = msg.chat.username;
    
    //greeteings(chat);
});

//Passed => TRUE
console.log("\"create\" RegExp:",commandList.create.test("/create"));//Testing regexp
console.log("\"start\" RegExp:",commandList.start.test("/start"));
console.log("\"delete\" RegExp:",commandList.delete.test("/delete"));

//Definig the data of the message
bot.on('message', function(msg){
    console.log(msg);
});

//End of testing section
//TODO: Match inputs of bot with 'commandList' and link them on scenario

function createUser(id, user) {

}

function greeteings(id) {
    bot.sendMessage(id, botDialog.greetings);
}

function startNewSubscription(id){
    bot.sendMessage(id, botDialog.startSubscription);
}

function checkAddress(id, address, api){
     request(api+address, function (err,resp) {
        if(!err && resp.statusCode == 200){
            bot.sendMessage(id, botDialog.addressApproved);
            return address;
        } else{
            bot.sendMessage(id, botDialog.addressDeclined);
            startNewSubscription(id)
        }
     });
}

function inputName(id, msg){
    const pattern = new RegExp(rules.nameRule);
    const name = msg.text;

    if(patten.test(name)){
        bot.sendMessage(id, botDialog.nameApproved);
        return name;
    } else {
        bot.sendMessage(id, botDialog.nameDeclined);
    }
}

function confirmation(id, name, address, msg){
    const pattern = new RegExp(rules.confirmationRule);
    const confirnmation = msg.text;

    if (pattern.test(confirnmation)){
        //add data saving
        bot.sendMessage(id, botDialog.nameConfirmed + name + botDialog.addressConfirmed + address);
    } else {
        bot.sendMessage(id, botDialog.subscriptionAbandon);
    }
}



//TODO: After matching create special words for `greetingScenario`, `createSubscriptionScenario` and `deletingScenario`

// bot.on('message', function (msg) {
//     const chatid = msg.chat.id;
//     if(commandList.start.test("/start") == msg.text){
//          bot.sendMessage(chatid, )
//     }
//
// });

