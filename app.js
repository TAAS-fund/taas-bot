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
    addressValidate: createRegExp(commands.addressValidate),
    nameValidate: createRegExp(commands.nameValidate)
};

let client;
let address;
let name;

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

    if(typeof msg.entities != "undefined" && commandList.start.test(message)) greetings(chat);
    if(typeof msg.entities != "undefined" && commandList.create.test(message)) startNewSubscription(chat);
    
    if(commandList.addressValidate.test(message)){
        request(api+message, function (err,resp) {
            if(!err && resp.statusCode == 200){
                address = message;
                bot.sendMessage(chat, "Address valide!\n\nPlease input the name of your wallet subscription.");
            } else{
                bot.sendMessage(chat, "Address not valide!\n\nCheck your address and try again with \/create command&");
            }
        });
    }

    if(typeof address != "undefined"){
        const pattern = commandList.nameValidate;

        if(pattern.test(message)){
            name = message
            bot.sendMessage(chat, "Name valide!");
            //bot.sendMessage(id, botDialog.nameApproved);
        } else {
            bot.sendMessage(chat, "Name not valide, try again!");
            //bot.sendMessage(id, botDialog.nameDeclined);
        }
    }
    
    if(typeof address != "undefined" && typeof name != "undefined"){
        client = {
            firstName: msg.chat.last_name,
            lastname: msg.chat.first_name,
            chatId: chat,
            subcriptions:{
                name: name,
                address: address
            }
        }

        bot.sendMessage(client.chatId, "Congrats, "+client.firstName+"!\n\nName of wallet: "+client.subcriptions.name+"\n\nAddress of wallet: "+client.subcriptions.address+"\n\nKeep updated!")
    }
});

//Passed => TRUE
console.log("\"create\" RegExp:",commandList.create.test("/create"));//Testing regexp
console.log("\"start\" RegExp:",commandList.start.test("/start"));
console.log("\"delete\" RegExp:",commandList.delete.test("/delete"));

//Definig the data of the message
bot.on('message', function(msg){
    //console.log(msg);
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
function createUser(user) {

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
function inputName(id, msg, name){
    const pattern = createRegExp(commandList.nameValidate);

    if(patten.test(name)){
        bot.sendMessage(id, botDialog.nameApproved);
        //bot.sendMessage(id, botDialog.nameApproved);
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

