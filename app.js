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

//Creating Client --> should be represented as session
let client;

//Creating Address of Subscribtion
let address;

//Creating Name of Subscription
let name;

//Creating List of respond data Object about transaction
let reqRes = []; 

//Creating List of Subscribtion Object
let subscriptions = [];

//(Very-very-very) Simple validation 
let validate;

let jsonBase;

let updates = [];
//TODO: Create session for user

//

//Converting any string to RegExp
function createRegExp(arg) {
    return new RegExp(arg);
}

//Dev section

//Bot logic
bot.on('message', function(msg){
    const chat = msg.chat.id;
    const message = msg.text;
    
    //Dubugging data manipulations
    console.log("Address of wallet:",address);
    console.log("Name of subscription:",name);
    console.log("Client scheme:",client);
    console.log("Validation mark:", validate);

    if(typeof msg.entities != "undefined" && commandList.start.test(message)){greetings(chat);} // `/start` command 
    if(typeof msg.entities != "undefined" && commandList.create.test(message)){startNewSubscription(chat);} // `/create` command
    
    //Checking address 
    if(commandList.addressValidate.test(message)){
        request(api+message, function (err,resp, body) {
            if(!err && resp.statusCode == 200){
                let info = JSON.parse(body);
                let trans = info.txrefs;
                
                for (i in trans){
                    if (trans[i].tx_input_n == 0){
                        reqRes.push({date: trans[i].confirmed, value: trans[i].value, incoming: true})
                    }else{
                        reqRes.push({date: trans[i].confirmed, value: trans[i].value, incoming: false})
                    }
                }
                address = message;
                console.log("Last trx:",reqRes[0]);

                bot.sendMessage(chat, "Address valide!\n\nPlease input the name of your wallet subscription.");
                //Turning on validation process
                validate = true;
            } else{
                bot.sendMessage(chat, "Address not valide!\n\nCheck your address and try again with \/create command&");
            }
        });
    }
    
    //Checking name && creating work object
    if(typeof address != "undefined" && validate === true){
        const pattern = commandList.nameValidate;
        if(pattern.test(message)){
            name = message
            client = {
                firstName: msg.chat.last_name,
                lastName: msg.chat.first_name,
                chatId: chat,
                subcriptions:{
                    name: name,
                    address: address,
                    last: reqRes[0]
                }
            }
            //Clearing usless data
            address = 'undefined';
            name = 'undefined';
        } else {
            bot.sendMessage(chat, "Name not valide, try again!");
            //bot.sendMessage(id, botDialog.nameDeclined);
        }
    }
    
    //Structurizing && saving data
    if(typeof client != "undefined" && validate == true){
        fs.readFile('users.json', 'utf8', function readFileCallback(err, data) {
           validate = false;
           if(err){
               console.log(err);
           } else {
               bot.sendMessage(client.chatId, "Congrats, "+client.firstName+"!\n\nName of wallet: "+client.subcriptions.name+"\n\nAddress of wallet: "+client.subcriptions.address+"\n\nKeep updated!");
               //Creating subscription list
               subscriptions.push({
                   name: client.subcriptions.name,
                   address: client.subcriptions.address,
                   last: reqRes[0]
               });
               
               obj = JSON.parse(data);

               if(typeof obj.users[0] == "undefined"){
                   //Pushing new user and subscribtion 
                   obj.users.push({
                       firstName: client.firstName,
                       lastName: client.lastName,
                       chatId: client.chatId,
                       subcriptions: subscriptions
                   });
               } else {
                   //Pushing new subscription if user exists
                   for(i in obj.users) {
                       if (obj.users[i].firstName == client.firstName && obj.users[i].chatId) {
                           obj.users[i].subcriptions.push({
                               name: client.subcriptions.name,
                               address: client.subcriptions.address,
                               last: reqRes[0]
                           });
                       }
                   }
                   //Clearing usless data 
                   client = 'undefined';
                   reqRes = [];
                   subscriptions = [];
               }
               json = JSON.stringify(obj);
               fs.writeFile('users.json', json, 'utf8');
           }
        });
    }
});
//TODO: Notification logic
//Notification logic

function requestData(){
    fs.readFile('users.json', 'utf8', function readFileCallback(err, data) {
        if (err){
            console.log(err);
        } else {
            jsonBase = JSON.parse(data);
            let update = {};

            for (i in jsonBase.users){
                console.log(jsonBase.users[i].firstName);//firstname
                console.log(jsonBase.users[i].chatId);//chatId
                update.chatId = jsonBase.users[i].chatId;//chatId
                console.log(update.chatId);
                for (j in jsonBase.users[i].subcriptions){
                    console.log(jsonBase.users[i].subcriptions[j].name);//Name of your subscription
                    update.subName = jsonBase.users[i].subcriptions[j].name
                    console.log(updates.subName);
                    console.log(jsonBase.users[i].subcriptions[j].address);//ETH address of your subscription
                    update.address = jsonBase.users[i].subcriptions[j].address;
                    console.log(update.address);
                    console.log(jsonBase.users[i].subcriptions[j].last.date);
                    update.lastTrx = jsonBase.users[i].subcriptions[j].last.date;
                    console.log(update.lastTrx);
                    console.log(jsonBase.users[i].subcriptions[j].last.incoming);
                    update.trxType = jsonBase.users[i].subcriptions[j].last.incoming;
                    console.log(update.trxType);
                }
            }
            console.log(update);
            // request(api+message, function (err,resp, body) {
            //     if(!err && resp.statusCode == 200){
            //         let info = JSON.parse(body);
            //         let trans = info.txrefs;
            //
            //         for (i in trans){
            //             if (trans[i].tx_input_n == 0){
            //                 updates.push({date: trans[i].confirmed, value: trans[i].value, incoming: true})
            //             }else{
            //                 updates.push({date: trans[i].confirmed, value: trans[i].value, incoming: false})
            //             }
            //         }
            //     } else {
            //         console.error("Reading \''users.json'\' problems occured!");
            //     }
            // });
        }
    });
}

setInterval(requestData, 1500);

// let json_data;
// fs.readFile('users.json', 'utf8', function(readFileCallback(err, data)){
//     if (err){
//         console.log(err);
//     } else {
//         json_data = JSON.parse(data);
// });


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