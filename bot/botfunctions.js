/**
 * Created by hlib on 6/22/17.
 */


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