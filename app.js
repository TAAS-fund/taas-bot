const request = require('request');
const config = require('config');
const fs = require('fs');
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

let req_res = [];
let subscriptions = [];

//TODO: Create session for user

//

//Converting any string to RegExp
function createRegExp(arg) {
    return new RegExp(arg);
}

//Dev section

bot.on('message', function(msg){
    const chat = msg.chat.id;
    const user = msg.chat.username;

    let message = msg.text;

    if(typeof msg.entities != "undefined" && commandList.start.test(message)) greetings(chat);
    if(typeof msg.entities != "undefined" && commandList.create.test(message)) startNewSubscription(chat);
    
    if(commandList.addressValidate.test(message)){
        request(api+message, function (err,resp, body) {
            if(!err && resp.statusCode == 200){
                let info = JSON.parse(body);
                let trans = info.txrefs;
                
                for (i in trans){
                    if (trans[i].tx_input_n == 0){
                        req_res.push({date: trans[i].confirmed, value: trans[i].value, incoming: true})
                    }else{
                        req_res.push({date: trans[i].confirmed, value: trans[i].value, incoming: false})
                    }
                }

                address = message;

                console.log(req_res[0]);
                console.log(req_res[1]);

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
            lastName: msg.chat.first_name,
            chatId: chat,
            subcriptions:{
                name: name,
                address: address
            }
        }

        bot.sendMessage(client.chatId, "Congrats, "+client.firstName+"!\n\nName of wallet: "+client.subcriptions.name+"\n\nAddress of wallet: "+client.subcriptions.address+"\n\nKeep updated!");

        subscriptions.push({
            name: client.subcriptions.name,
            address: client.subcriptions.address,
            last: req_res[0]
        });

        console.log(subscriptions);

        fs.readFile('users.json', 'utf8', function readFileCallback(err, data) {
           if(err){
               
               console.log(err);
               
           } else {
               
               obj = JSON.parse(data);

               console.log(obj);

               if(typeof obj.users[0] == "undefined"){
                   obj.users.push({
                       firstName: client.firstName,
                       lastName: client.lastName,
                       chatId: client.chatId,
                       subcriptions: subscriptions
                   });
               } else {
                   for(i in obj.users) {
                       if (obj.users[i].firstName == client.firstName && obj.users[i].chatId) {
                           obj.users[i].subcriptions.push({
                               name: client.subcriptions.name,
                               address: client.subcriptions.address,
                               last: req_res[0]
                           });
                       }
                   }
               }

               json = JSON.stringify(obj);
               console.log(json);
               fs.writeFile('users.json', json, 'utf8');
               
           }
        });
    }
});
//TODO: Notification logic
//Notification logic

// let json_data;
// fs.readFile('users.json', 'utf8', function(readFileCallback(err, data)){
//     if (err){
//         console.log(err);
//     } else {
//         json_data = JSON.parse(data);
// });


//Passed => TRUE

console.log("\"create\" RegExp:",commandList.create.test("/create"));//Testing regexp
console.log("\"start\" RegExp:",commandList.start.test("/start"));
console.log("\"delete\" RegExp:",commandList.delete.test("/delete"));

//End of testing section
//TODO: Match inputs of bot with 'commandList' and link them on scenario

/*
    Dev part of bot/botfunctions.js
    All code below should be pasted to bot/* or other logic distribution by functionality
    Or not
    Decigion required
*/

//Greeting new user
function greetings(id) {
    bot.sendMessage(id, botDialog.greetings);
}

//Called in case of `/start` bot-command || initializing new subscription process
function startNewSubscription(id){
    bot.sendMessage(id, botDialog.startNewSubscription);
}
