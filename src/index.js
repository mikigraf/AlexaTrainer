'use strict';

/**
 * App ID for the skill
 */
var APP_ID = "amzn1.ask.skill.d185bd2f-dbed-483d-b14b-d60b21e49de5";

/**
 * Import the library for Node.js Alexa SDK into an `Alexa` object
 */
var Alexa = require('alexa-sdk');

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.dynamoDBTableName = 'alexaTrainerTable'; 
    alexa.registerHandlers(newSessionHandlers, startSessionHandlers, exerciseHandlers);
    alexa.execute();
};

var states = {
    STARTMODE: '_STARTMODE',     // Start a new exercise (workout started already)
    EXERCISEMODE: '_EXERCISEMODE'  // User is counting after Alexa
};

var newSessionHandlers = {
     // This will short-cut any incoming intent or launch requests and route them to this handler.
    'NewSession': function() {
        this.attributes['exercisesDone'] = 0;
        this.attributes['totalExercisesDone'] = ''; // weirdly hacked tgt string of all exercise counts e.g. "P9S2B4"
        if(Object.keys(this.attributes).length === 0) { // Check if it's the first time the skill has been invoked
            this.emit('GetName');
        }
        this.handler.state = states.STARTMODE; // Transition to STARTMODE state.
        this.emit(':ask', 'Hello, I am your trainer. You have done ' + 
            this.attributes['exercisesDone'].toString() + ' exercises. Would you like to do some push-ups?',
            'Would you like to do some push-ups?');
    },
    'GetName': function() {
        this.handler.state = states.STARTMODE; // Transition to STARTMODE state.
        this.emit(':ask', 'What is your name?', 'I asked, what is your name?')
    }
};


var startSessionHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'SayNameIntent': function() {
        this.emit(':ask', 'Hello, I am your trainer. You have done ' + 
            this.attributes['exercisesDone'].toString() + ' exercises. Would you like to do some push-ups?',
            'Would you like to do some push-ups?');
    }
    'NewSession': function () {
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },
    'AMAZON.HelpIntent': function() {
        var message = 'I will guide you through exercises.' +
            'Do you want to start the workout?';
        this.emit(':ask', message, message);
    },
    'JustYesIntent': function() {
        this.emit(':ask', "Yes ma'am.", "I expect you to reply with yes, ma'am.");
    },
    'YesMaamIntent': function() {
        this.handler.state = states.EXERCISEMODE;
        this.attributes['repsDone'] = 1;
        this.emit(':ask', 'Good. Get into position. <break time="5s"/> Repeat after me. One.', 'Try saying a number.');
    },
    'AMAZON.NoIntent': function() {
        this.emit(':ask', 'Do it for Harambe.');
    },
    'ReallyNoIntent': function() {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function() {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.StopIntent': function() {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest': function () {
        console.log('session ended!');
        this.emit(':tell', 'Your workout has ended. Good-bye.');
    },
    'Unhandled': function() {
        var message = 'Do you want to start the workout?.';
        this.emit(':ask', message, message);
    }
});

var exerciseHandlers = Alexa.CreateStateHandler(states.EXERCISEMODE, {
    'AMAZON.HelpIntent': function() {
        var repCount = this.attributes['repsDone'];
        var message = 'I will guide you through this exercise.' +
            'Repeat after me.' + repCount.toString();
        this.emit(':ask', message, message);
    },
    'IncrementRepsIntent': function() {
        this.attributes['repsDone'] += 1;
        var repCount = this.attributes['repsDone'];
        this.emit(':ask', repCount.toString(), 'Repeat after me.' + repCount.toString());
    },
    'StopExerciseIntent': function() {
        var repCount = this.attributes['repsDone'];
        this.attributes['exercisesDone'] += 1;
        this.handler.state = states.STARTMODE;
        this.emit(':ask', 'You have done ' + repCount.toString() + 'push-ups. Do you want to do another exercise?', 'Do you want to do another exercise?');
    },
    'Unhandled': function() {
        var message = 'Do you want to continue this exercise?';
        this.emit(':ask', message, message);
    }
});