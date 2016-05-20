'use strict';

const _ = require('lodash');
const Script = require('smooch-bot').Script;

const scriptRules = require('./script.json');

module.exports = new Script({
    processing: {
        //prompt: (bot) => bot.say('Beep boop...'),
        receive: () => 'processing'
    },

    start: {
        receive: (bot) => {
            return bot.say('Hi! I\'m Julie')
                .then(() => 'askName');
        }
    },

    askName: {
        prompt: (bot) => bot.say('What\'s your name?'),
        receive: (bot, message) => {
            const name = message.text;
            return bot.setProp('name', name)
                .then(() => bot.say(`Great! nice to meet you ${name} congratulations on the new job`))
                .then(() => 'askhow');
        }
    },
    
    askhow: {
        prompt: (bot) => bot.say('So how are you feeling about the new role?'),
        receive: (bot, message) => {
            const how = message.text;
            return bot.setProp('how', how)
                .then(() => bot.say(`I'd love to hear more about this, if you want to talk some more please type MORE`))
                .then(() => 'speak');
        }
    },
    
     speak: {
        receive: (bot, message) => {

            let upperText = message.text.trim().toUpperCase();

            function updateSilent() {
                switch (upperText) {
                    case "CONNECT ME":
                        return bot.setProp("silent", true);
                    case "DISCONNECT":
                        return bot.setProp("silent", false);
                    default:
                        return Promise.resolve();
                }
            }

            function getSilent() {
                return bot.getProp("silent");
            }


/* getReply should allow for some variety in responses for received text messages that 
do not have an entry in the scripts.json file. */
            function getReply() {
                var messages = [ "Sorry. I'm not configured with a response to your message. Text COMMANDS to see a few examples.",
                                 "Hey, I didn't understand that. I suggest sending HELP OUT",
                                 "Text me ABOUT to learn about the JBot project.",
                                 "You're not sending messages to an Artifical Intelligence program. Try MORE to see some other COMMANDS",
                                 "The program responds to COMMANDS only. You have to send a command that I understand. :)",
                                 "The JBot is not a human. It is just a series of files on a computer. Text ABOUT to learn more.",
                                 "Seriously, you are wayyyyy smarter than JBot. It just knows simple COMMANDS",
                                 "Yo. I do not know what you are talking about. Send me a HELLO",
                                 "There is a ton of information in JBot. You have to use COMMANDS to find it.",
                                 "That's interesting. Hhhmmm... I never thought of that. Maybe try HELP OUT",
                                 "Can you say that again?",
                                 "Yeah... that happens from time to time. Try COMMANDS or ABOUT.",
                                 "That is a ton of words you just wrote there... I really don't know. Try MORE",
                                 "Right now, punctuation throws me off. Send text without it. Try HELP OUT",
                                 "Try sending a command without punctuation.",
                                 "I'm not programmed to ignore punctuation. So if you're sending something other than letters... I don't understand it."
                                ];

                var arrayIndex = Math.floor( Math.random() * messages.length );


                return messages[arrayIndex];
                
            }

            function processMessage(isSilent) {
                if (isSilent) {
                    return Promise.resolve("speak");
                }

/* remove the text in between the () after bot.say and place the function getReply() */

                if (!_.has(scriptRules, upperText)) {
                    return bot.say( getReply() ).then( () => 'speak');
                }

                var response = scriptRules[upperText];
                var lines = response.split('\n');

                var p = Promise.resolve();
                _.each(lines, function(line) {
                    line = line.trim();
                    p = p.then(function() {
                        console.log(line);
                        return bot.say(line);
                    });
                })

                return p.then(() => 'speak');
            }

            return updateSilent()
                .then(getSilent)
                .then(processMessage);
        }
    }
});
