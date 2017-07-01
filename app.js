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
                        reqRes.push({date: new Date(trans[i].confirmed), value: trans[i].value/1000000000000000000, finalBalance: info.final_balance/1000000000000000000, incoming: false})
                    }else{
                        reqRes.push({date: new Date(trans[i].confirmed), value: trans[i].value/1000000000000000000, finalBalance: info.final_balance/1000000000000000000, incoming: true})
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
            name = message;
            client = {
                firstName: msg.chat.last_name,
                lastName: msg.chat.first_name,
                chatId: chat,
                subcriptions:{
                    name: name,
                    address: address,
                    last: reqRes[0]
                }
            };
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
        bot.sendMessage(client.chatId,
            "Congrats, "+client.firstName+
            "!\n\nName of wallet: "+client.subcriptions.name+
            "\n\nAddress of wallet: "+client.subcriptions.address);

        fs.readFile('users.json', 'utf8', function readFileCallback(err, data) {
           validate = false;
           if(err){
               console.log(err);
           } else {
               //Creating subscription list
               subscriptions.push({
                   name: client.subcriptions.name,
                   address: client.subcriptions.address,
                   last: reqRes[0]
               });
               
               obj = JSON.parse(data);

               bot.sendMessage(client.chatId, 
                   "Last trx:\n"+
                   "Date: "+client.subcriptions.last.date+
                   "\nValue: "+client.subcriptions.last.value+
                   "\nIncoming: "+client.subcriptions.last.incoming+
                   "\nFinal balance ETH: "+client.subcriptions.last.finalBalance);

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
            let userData = JSON.parse(data);
            for(i in userData.users){
                for(j in userData.users[i].subcriptions){
                    request(api+userData.users[i].subcriptions[j].address, function (err,resp, body) {
                        if(!err && resp.statusCode == 200){
                            let info = JSON.parse(body);
                            let trans = info.txrefs;
                            for (k in trans){
                                if (trans[k].tx_input_n == 0){
                                    console.log(trans[k].confirmed, trans[k].value/1000000000000000000, "false");
                                    userData.users[i].subcriptions[j].last = {date: new Date(trans[k].confirmed), value: trans[k].value/1000000000000000000, finalBalance: info.final_balance/1000000000000000000, incoming: false}
                                }else{
                                    console.log(trans[k].confirmed, trans[k].value/1000000000000000000, "true");
                                    userData.users[i].subcriptions[j].last = {date: new Date(trans[k].confirmed), value: trans[k].value/1000000000000000000, finalBalance: info.final_balance/1000000000000000000, incoming: true}
                                }
                            }
                        } else {
                            console.error("Error requestiong data:", err, resp.statusCode);
                        }
                    });
                }
            }
            //TODO:Saving data to JSON file && bot send messege with updates required
        }
    });
}

setInterval(requestData, 50000);

//Greeting new user
function greetings(id) {
    bot.sendMessage(id, botDialog.greetings);
}

//Called in case of `/start` bot-command || initializing new subscription process
function startNewSubscription(id){
    bot.sendMessage(id, botDialog.startNewSubscription);
}