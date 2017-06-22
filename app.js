const request = require('request');
const config = require('config');

const TelegramBot = require('node-telegram-bot-api');
const token = config.get('Telegram-bot.token');
const bot = new TelegramBot(token, { polling: true });

const commands = config.get('commands');
const botDialog = config.get('Bot-messages');
const blockCypher = config.get('API.BlockCypher');
const api = blockCypher.host + blockCypher.path;

const commandList = {
    start: createRegExp(commands.start),
    create: createRegExp(commands.create),
    delete: createRegExp(commands.delete),
    addressConfirm: createRegExp(commands.addressConfirm)
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

    let message = msg.text;
    let address;
    let name;

    if(typeof msg.entities != "undefined" && commandList.start.test(message)) greetings(chat);
    if(typeof msg.entities != "undefined" && commandList.create.test(message)) startNewSubscription(chat);
    if(commandList.addressConfirm.test(message) && typeof msg.entities == "undefined"){
        checkAddress(chat, message, api);
    } else {
        bot.sendMessage(chat, "Some text")
    }
    // console.log(msg.entities);
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


/*
    Dev part of bot/botfunctions.js
    All code below should be pasted to bot/* or other logic distribution by functionality
    Or not
    Decigion required
*/

//TODO: Saving user data
function createUser(id, user) {

}

//Greeting new user
function greetings(id) {
    bot.sendMessage(id, botDialog.greetings);
}

//Called in case of `/start` bot-command || initializing new subscription process
function startNewSubscription(id){
    bot.sendMessage(id, botDialog.startNewSubscription);
}

//Checking the input of ETH wallet for it's existing in Etherium blockchain
function checkAddress(id, address, api){
     request(api+address, function (err,resp) {
        if(!err && resp.statusCode == 200){
            bot.sendMessage(id, botDialog.addressApproved);
        } else{
            bot.sendMessage(id, botDialog.addressDeclined);
            startNewSubscription(id)
        }
     });
}

//Checking the name with RegExp (*rulles in development)
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

//Subscription confirmation logic || finalization of user subscription to ETH wallet
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


//
//TODO: After matching create special words for `greetingScenario`, `createSubscriptionScenario` and `deletingScenario`

// bot.on('message', function (msg) {
//     const chatid = msg.chat.id;
//     if(commandList.start.test("/start") == msg.text){
//          bot.sendMessage(chatid, )
//     }
//
// });
