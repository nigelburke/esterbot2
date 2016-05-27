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
            return bot.say('Hi I\'m Julie')
                .then(() => 'askName');
        }
    },

    askName: {
        prompt: (bot) => bot.say('What\'s your name?'),
        receive: (bot, message) => {
            const name = message.text;
            return bot.setProp('name', name)
                .then(() => bot.say(`Nice to meet you ${name} congratulations on the new job`))
                .then(() => 'askhow');
        }
    },
    
    askhow: {
        prompt: (bot) => bot.say('So how are you feeling about the new role?'),
        receive: (bot, message) => {
            const how = message.text;
            return bot.setProp('how', how)
                .then(() => bot.say(`I'd love to hear more about that, if you'd like to carry on please type MORE`))
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
                var messages = [ "Sorry. I'm didn't quite understand that one, could you try saying it a different way?",
"Hey, I didn't understand that. I suggest typing HELP OUT",
"Text me ABOUT to learn about the Rusdens onboarding project.",
"I'm a computer chatbot that only responds to simple command. Maybe try rephrasing or type ABOUT to learn more",
"The Chat is not a human, it is just a series of files on a computer. Text ABOUT to learn more.",
"Seriously, you are wayyyyy smarter than me, could you try saying that in a different way?",
"Sorry, I do not know what you are talking about.",
"That's interesting, I never thought of that.",
"Can you say that again?",
"Yeah... that happens from time to time. Try HELP OUT or ABOUT.",
"That is a ton of words you just wrote there... I really don't know. Try HELP OUT ",
"Right now, punctuation throws me off. Send text without it",
"Try sending a command without punctuation.",
"At this stage I'm programmed to ignore punctuation,  so if you're sending something other than letters there's a chance that I won't understand it."

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
