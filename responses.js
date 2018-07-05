exports.counts = {
  "bulls" : ["bulls", "bull"],
  "cows" : ["cows", "cow"],
};

exports.mySuggesstions = [
  ["Stop game"],
  ["Need clue", "Stop game"],
  ["Yes", "No"],
];

exports.myResponse = [
  "",
  "Welcome to the Yugan's Bulls and Cows game. Digits should be totally " +
  "differnt.! Give me the five digit number!",
  "You are very close.",
  "Please give me the correct number. Number should be five digit.",
  "\nCongratulations.! You found the number. Do you want to play again?",
  "Please give me the right digits. Five digits should be unique.",
];

exports.clueAndStop = [
  {
    "first": "Hmm, You not just close to give clue. Just try.!",
    "second": "Well, Here is your best bulls, which you have found early.\n",
  },
  {
    "first": "Okay, Thanks for your time with this game.",
    "second": "You haven't found the solution yet. " +
      "Anyways, My guessing number is",
  }
];