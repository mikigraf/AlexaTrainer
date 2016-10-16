'use strict';

/**
 * App ID for the skill
 */
var APP_ID = "amzn1.ask.skill.d185bd2f-dbed-483d-b14b-d60b21e49de5";

/**
 * Import the library for Node.js Alexa SDK into an `Alexa` object
 */
var Alexa = require('alexa-sdk');
var http = require("http");
var options = {
  hostname: 'alexa-trainer.herokuapp.com',
  port: 80,
  path: '/test',
  method: 'POST',
  headers: {
      'Content-Type': 'application/json',
  }
};


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
        this.attributes['totalRepsDone'] = 0; // weirdly hacked tgt string of all exercise counts e.g. "P9S2B4"
        this.handler.state = states.STARTMODE; // Transition to STARTMODE state.

        var exercisesNoun = this.attributes['exercisesDone'] != 1 ? "exercises" : "exercise";

        this.emit(':ask', 'Hello, I am your trainer. You have done ' + 
            this.attributes['exercisesDone'].toString() + ' ' + exercisesNoun + '. Would you like to do some push-ups?',
            'Would you like to do some push-ups?');
    }
};

var startSessionHandlers = Alexa.CreateStateHandler(states.STARTMODE, {
    'NewSession': function () {
        this.emit('NewSession'); // Uses the handler in newSessionHandlers
    },
    'AMAZON.HelpIntent': function() {
        var message = 'I will guide you through exercises.' +
            'Do you want to start the workout?';
        this.emit(':ask', message, message);
    },
    'JustYesIntent': function() {
        this.emit(':ask', "Yes what?", "I expect you to reply with yes, ma'am.");
    },
    'YesMaamIntent': function() {
        this.handler.state = states.EXERCISEMODE;
        this.attributes['repsDone'] = 1;
        this.emit(':ask', 'Good. Get into position. <break time="5s"/> Repeat after me. One.', 'Repeat after me. One.');
    },
    'AMAZON.NoIntent': function() {
        this.emit(':ask', 'Do it for Harambe.', 'You should do it for Harambe.');
    },
    'ReallyNoIntent': function() {
        var pushups_count = this.attributes['totalRepsDone'];
        var req = http.request(options, function(res) {
          console.log('Status: ' + res.statusCode);
          console.log('Headers: ' + JSON.stringify(res.headers));
          res.setEncoding('utf8');
          res.on('data', function (body) {
            console.log('Body: ' + body);
          });
        });
        req.on('error', function(e) {
          console.log('problem with request: ' + e.message);
        });
        // write data to request body
        req.write('{"date": "Sunday", "pushUps":' + pushups_count + ' }');
        req.end();
        this.emit(':tell', 'Your workout has ended. Good-bye.');
    },
    'AMAZON.CancelIntent': function() {
        var pushups_count = this.attributes['totalRepsDone'];
        var req = http.request(options, function(res) {
          console.log('Status: ' + res.statusCode);
          console.log('Headers: ' + JSON.stringify(res.headers));
          res.setEncoding('utf8');
          res.on('data', function (body) {
            console.log('Body: ' + body);
          });
        });
        req.on('error', function(e) {
          console.log('problem with request: ' + e.message);
        });
        // write data to request body
        req.write('{"date": "Sunday", "pushUps":' + pushups_count + ' }');
        req.end();
        this.emit(':tell', 'Your workout has ended. Good-bye.');
    },
    'AMAZON.StopIntent': function() {
        var pushups_count = this.attributes['totalRepsDone'];
        var req = http.request(options, function(res) {
          console.log('Status: ' + res.statusCode);
          console.log('Headers: ' + JSON.stringify(res.headers));
          res.setEncoding('utf8');
          res.on('data', function (body) {
            console.log('Body: ' + body);
          });
        });
        req.on('error', function(e) {
          console.log('problem with request: ' + e.message);
        });
        // write data to request body
        req.write('{"date": "Sunday", "pushUps":' + pushups_count + ' }');
        req.end();
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
        if (repCount > 3) {
            this.emit(':ask', "Another one.", "Another one.");
        } else {
            this.emit(':ask', repCount.toString(), 'Repeat after me.' + repCount.toString());
        }
    },
    'StopExerciseIntent': function() {
        this.attributes['repsDone'] -= 1;
        var repCount = this.attributes['repsDone'];
        this.attributes['exercisesDone'] += 1;
        this.attributes['totalRepsDone'] += repCount;
        this.handler.state = states.STARTMODE;
        this.emit(':ask', 'You have done ' + repCount.toString() + ' push-ups. Do you want to do another exercise?', 'Do you want to do another exercise?');
    },
    'Unhandled': function() {
        var message = 'Repeat after me.';
        this.emit(':ask', message, message);
    }
});