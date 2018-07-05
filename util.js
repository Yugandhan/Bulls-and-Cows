'use strict';
const util = require('util');
const { SimpleResponse } = require('actions-on-google');

exports.fCounts = (counts, result) => {
  if (result[0] === 0 && result[1] === 0)
    return "There is no bulls and cows. You can forget those digits.!";
  else
    return util.format("%d %s %d %s. ", result[0],
      counts.bulls[(result[0] === 1) ? 1 : 0],
      result[1], counts.cows[(result[1] === 1) ? 1 : 0]);
};

exports.fSugges = (response, clue, stop) => {
  if (stop)
    return response.mySuggesstions[2];
  if (clue)
    return response.mySuggesstions[1];
  return response.mySuggesstions[0];
};

exports.fRespon = (response, result) => {
  if (result[0] === 5)
    return response.myResponse[4];
  if ((result[0] + result[1]) === 4)
    return response.myResponse[2];
  return response.myResponse[0];
};

exports.fValidate = (response, Err) => {
  return response.myResponse[Err];
};

// (response, clue(0) and stop(1), for if/else, array to loop)
exports.fClueAnsStop = (conv, response, CS, check, array) => {
  var speech = '',
    text = '';

  if (check) {
    speech = response.clueAndStop[CS].first;
    text = speech;
  } else {
    var rtnString = '';
    array.forEach((item) => {
      rtnString += ' ' + item;
    });
    speech = response.clueAndStop[CS].second;
    text = speech + rtnString + '.';
  }
  if (CS)
    conv.close(new SimpleResponse({ speech: speech, text: text }));
  else
    conv.ask(new SimpleResponse({ speech: speech, text: text }));
};