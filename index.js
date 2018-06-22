'use strict';

process.env.DEBUG = 'actions-on-google:*';
const {
    dialogflow,
    DeliveryAddress,
    OrderUpdate,
    TransactionDecision,
    TransactionRequirements,
} = require('actions-on-google');

const http = require('http');
const { SimpleResponse, Suggestions } = require('actions-on-google');
const functions = require('firebase-functions');
const responses = require('./responses');
const { fCounts, fSugges, fRespon, fValidate, fClueAnsStop } = require('./util');

const app = dialogflow({ debug: true });

const host = 'api.railwayapi.com';
const ApiKey = 'zzrf80sfit';
const RANDOM_STRING = "5129406783";

//Response
const RES_START = 1;
const RES_CLOSE_GUESS = 2;
const RES_FIVE_DIGIT_ERR = 3;
const RES_FOUND = 4;
const RES_END = 5;
const RES_REPEAT_DIGIT_ERR = 6;

const RESULT_FOUND = 5;
const SUCCESS = 0;

const CLUE = 0;
const STOP = 1;

var game = function () {
    this.generateRandom = (conv) => {
        let str = RANDOM_STRING,
            i = 9, j = 10;
        var arr = str.split('');
        for (i = 0; i < 5; i++) {
            let k = Math.floor(Math.random() * j);
            let tmp = arr[k];
            arr[k] = arr[j - 1];
            arr[j - 1] = tmp;
            j--;
        }
        if(arr[0] === '0'){
            let tmp = arr[1];
            arr[1] = arr[0];
            arr[0] = tmp;
        }
        return conv.data.myNumber = arr.slice(0, 5);
    }

    this.giveBullCows = (conv, guessNumber) => {
        conv.data.hisLastMatch = guessNumber;
        var my = conv.data.myNumber,
            result = [0, 0], i = 0,
            bullsTmp = new Array(5),
            maxBullsInThisTry = 0,
            hisCowsFreq = new Array(10);

        hisCowsFreq.fill(false);
        bullsTmp.fill("-");

        for (i = 0; i < 5; i++) {
            if (my[i] === guessNumber[i]) {
                result[0]++;
                bullsTmp[i] = guessNumber[i];
            }
            else {
                hisCowsFreq[parseInt(guessNumber[i])] = true;
            }
        }
        if (conv.data.hisBestBullsCnt < result[0]) {
            conv.data.hisBestBullsCnt = result[0];
            conv.data.hisBestBullsMatch = bullsTmp;
            conv.data.isClue = true;
            conv.contexts.set('contextNeedClue', 5);
        }
        conv.data.myNumber.forEach((item) => {
            if (hisCowsFreq[parseInt(item)] === true)
                result[1]++;
        });
        if (result[0] === RESULT_FOUND) {
            conv.data.found = true;
            conv.contexts.set('contextStopGameYes', 1);
            conv.contexts.set('contextStopGameNo', 1);
        }
        return result;
    }
    this.validateNumber = (guessNumber) => {
        var validate = true, i = 0;
        var freq = new Array(10);
        freq.fill(false);

        if (guessNumber.length !== 5)
            return RES_FIVE_DIGIT_ERR;
        var arr = guessNumber.map(Number);
        for (i = 0; i < 5; i++) {
            if (freq[arr[i]] === true) {
                return RES_REPEAT_DIGIT_ERR;
            }
            freq[arr[i]] = true;
        }
        return SUCCESS;
    }
};

var myGame = new game();

app.intent('Start game', (conv) => {
    conv.data.myNumber = new Array(5);
    this.randomNumber = RANDOM_STRING;
    conv.data.isClue = false;
    conv.data.found = false;
    conv.data.hisBestBullsCnt = 0;
    conv.data.hisBestBullsMatch = new Array(5);
    conv.data.hisLastMatch = new Array(5);
    conv.data.hisBestMatch = new Array(5);
    conv.data.maxTry = 0;
    myGame.generateRandom(conv);
    console.log("MyNumber: ", conv.data.myNumber);
    conv.contexts.set('contextNeedClue', 0);
    conv.contexts.set('contextStopGameYes', 0);
    conv.contexts.set('contextStopGameNo', 0);
    conv.ask(responses.myResponse[RES_START]);
});
app.intent('Start game - Play again - Yes', 'Start game');

app.intent('Start game - Stop game', (conv) => {
    console.log("context : ", conv.contexts);
    console.log("myNumber : ", conv.data.myNumber);

    fClueAnsStop(conv, responses, STOP, (conv.data.found === true),
        conv.data.myNumber);
});
app.intent('Start game - Play again - No', 'Start game - Stop game');

app.intent('Start game - select.number', (conv) => {
    var myNumber = conv.data.myNumber,
        hisNumber = conv.body.queryResult.parameters.number.toString().split('');

    console.log("hisNumber: ", hisNumber);
    var rtn = 0,
        rtnString = '',
        rtnSugges = [];

    rtn = myGame.validateNumber(hisNumber);
    console.log("Validation: ", rtn);
    if ((rtn !== SUCCESS)) {
        rtnString = fValidate(responses, rtn);
    } else {
        var result = myGame.giveBullCows(conv, hisNumber);
        console.log("(Bulls, Cows) : ", result);

        rtnString = fCounts(responses.counts, result);
        rtnSugges = fSugges(responses, conv.data.isClue, 
            (result[0] === RESULT_FOUND));
        rtnString += fRespon(responses, result);

        console.log("rtnString: ", rtnString);
        console.log("rtnSugges: ", rtnSugges);
    }
    conv.ask(rtnString);
    conv.ask(new Suggestions(rtnSugges));
});

app.intent('Start game - Need clue', (conv) => {
    console.log("context : ", conv.contexts);
    console.log("hisBestBullsMatch : ", conv.data.hisBestBullsMatch);

    fClueAnsStop(conv, responses, CLUE, (conv.data.hisBestBullsCnt < 2),
        conv.data.hisBestBullsMatch);
});

app.intent('Start game - feedback', (conv) => {
    conv.close('You can reach me at yugandhanboss@gmail.com');
});

exports.dialogflowPNRStatus = functions.https.onRequest(app);
