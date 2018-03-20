var moment = require('moment');

// API
function listFriends() {
}

function addUser(user) {
}

function addEvent(user, day, memo) {
}

function showHelp() {
}

// Default behavior
var callDefault = listFriends;

// figure out which command you're running
var args = process.argv.slice(2);
if (0 === args.length) {
  callDefault();
} else if (4 === args.length && 'add' === args[0]) {
  addEvent(args[1], args[2], args[3]);
} else {
  showHelp();
}


