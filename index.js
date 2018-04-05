"use strict";
var moment = require("moment");
var _ = require("lodash");
var fs = require("fs");
var rl = require("readline");

// Constants
var DIRECTORY = process.argv[1].substring(0, process.argv[1].lastIndexOf("/") + 1);
var FRIENDS_PATH = DIRECTORY + "data/friends.json";
var EVENTS_PATH = DIRECTORY + "data/events.json";
var CONFIG_PATH = DIRECTORY + "config.json";

var DATE_STORAGE_FORMAT = "YYYY-MM-DD";
var DATE_PARSE_FORMAT = "YYYY-MM-DD";
var DATE_DISPLAY_FORMAT = "YYYY-MM-DD";
var TODAY = moment().startOf("day");
var DEFAULT_NUM_DAYS = 10;

// Config
var config = loadConfigData();

// Data transfer
function loadFriendsData() {
  var rawFriends = fs.readFileSync(FRIENDS_PATH);
  return JSON.parse(rawFriends);
}

function loadEventsData() {
  var rawEvents = fs.readFileSync(EVENTS_PATH);
  return JSON.parse(rawEvents);
}

function writeFriendsData(friends) {
  var rawNewFriends = stringify(friends);
  fs.writeFileSync(FRIENDS_PATH, rawNewFriends);
}

function writeEventsData(events) {
  var rawNewEvents = stringify(events);
  fs.writeFileSync(EVENTS_PATH, rawNewEvents);
}

function stringify(jsonObject) {
  if (config.prettyPrintJson) {
    return JSON.stringify(jsonObject, null, 2);
  }
  return JSON.stringify(jsonObject);
}

function loadConfigData() {
  try {
    var rawConfig = fs.readFileSync(CONFIG_PATH);
    return JSON.parse(rawConfig);
  } catch (err) {
    return {};
  }
}

// Helper functions
function ask(question, callback) {
  var r = rl.createInterface({
    input: process.stdin,
    output: process.stdout});
  r.question(question + "\n", function(answer) {
    r.close();
    callback(answer);
  });
}

function getFriendByName(friends, name) {
  return _.filter(friends, friend => friend.name === name);
}

// Date-related helpers
function convertDaysToNumber(days) {
  var numDays = +days;
  if (!numDays || numDays <= 0) {
    fail("Please use a positive number of days (specified '" + days + "')");
  }
  return days;
}

/**
 * Returns a Moment.
 */
function parseDate(input) {
  var date;
  if (input === "today") {
    date = moment();
  } else if (input === "yesterday" || input === "yday") {
    date = moment().subtract(1, "days");
  } else if (parseWeekday(input)) {
    date = parseWeekday(input);
  } else {
    date = moment(input, DATE_PARSE_FORMAT, true);
    if (!date.isValid()) {
      fail("Invalid date (specified '" + input + "')");
    }
  }
  return date.startOf("day");
}

function parseWeekday(s) {
  const weekdays = [
    ["sunday",    "sun"],
    ["monday",    "mon"],
    ["tuesday",   "tue"],
    ["wednesday", "wed"],
    ["thursday",  "thu"],
    ["friday",    "fri"],
    ["saturday",  "sat"],
  ];
  for (let i = 1; i <= 7; i++) {
    const d = moment(TODAY).subtract(i, "days");
    if (weekdays[d.day()].indexOf(s) !== -1) {
      return d;
    }
  }
  return false;
}

// Public API
function listFriends() {
  var NEW_INDICATOR = "new       ";

  var events = loadEventsData();
  var friends = loadFriendsData();

  var eventsByFriend = _.groupBy(events, "name");
  var nextEventByFriend = _.map(friends, friend => {
    var lastEvent = _.sortBy(eventsByFriend[friend.name], "date").reverse()[0];
    return {
      name: friend.name,
      date: lastEvent ? moment(lastEvent.date).add(friend.interval, "days").format(DATE_DISPLAY_FORMAT) : NEW_INDICATOR
    };
  });
  _.sortBy(nextEventByFriend, "date").forEach(friend => {
    const today = TODAY.format(DATE_DISPLAY_FORMAT); // TODO - what if date display format is not Year, Month, Day?
    const dateColumn = friend.date + (friend.date < today ? "*" : " ");
    console.log(dateColumn + " " + friend.name);
  });
}

function addFriend(name, days) {
  var friends = loadFriendsData();
  var myFriend = getFriendByName(friends, name)[0];
  if (myFriend) {
    fail("Friend " + name + " already exists");
  }
  var numDays = days !== undefined ? convertDaysToNumber(days) : DEFAULT_NUM_DAYS;
  friends.push({"name": name, "interval": numDays});
  writeFriendsData(friends);
  console.info("Added friend " + name);
}

function editFriend(name, days) {
  var friends = loadFriendsData();
  var myFriend = getFriendByName(friends, name)[0];
  if (!myFriend) {
    return ask(
      "New friend " + name + "! Add them to friendlog? [yN]",
      (answer) => ifYesAddFriend(answer, name, () => editFriend(name, days))
    );
  }
  var numDays = convertDaysToNumber(days);
  var oldNumDays = myFriend.interval;
  myFriend.interval = numDays;
  writeFriendsData(friends);
  console.info("Friend " + name + " now at " + numDays + " days (was " + oldNumDays + ")");
}

function listFriend(name) {
  var friends = loadFriendsData();
  var myFriend = getFriendByName(friends, name)[0];
  if (!myFriend) {
    return ask(
      "New friend " + name + "! Add them to friendlog? [yN]",
      (answer) => ifYesAddFriend(answer, name, () => listFriend(name))
    );
  }
  console.log(myFriend);
}

function addEvent(friendName, date, memo) {
  var friends = loadFriendsData();
  var myFriend = getFriendByName(friends, friendName)[0];
  if (!myFriend) {
    return ask(
      "New friend " + friendName + "! Add them to friendlog? [yN]",
      (answer) => ifYesAddFriend(answer, friendName, () => addEvent(friendName, date, memo))
    );
  }
  var events = loadEventsData();
  var isoDate = parseDate(date).format(DATE_STORAGE_FORMAT);
  events.push({"name": friendName, "date": isoDate, "memo": memo});
  writeEventsData(events);
  console.info("Added event '" + memo + "' on " + isoDate + " with " + friendName);
}

function ifYesAddFriend(answer, name, callback) {
  if (-1 !== ["y", "yes", "Y", "YES"].indexOf(answer)) {
    addFriend(name);
    return callback();
  }
  fail("Friend " + name + " does not exist");
}

function showHelp() {
  console.log("welcome to friendlog :-)");
  console.log("   add [friend] [interval=10] " + "Adds [friend]. Events expected every [interval] days");
  console.log("   list                       " + "Lists each friend and their next expected event");
  console.log("   list [friend]              " + "View info about [friend]");
  console.log("   edit [friend] [interval]   " + "Edits [friend]'s expected [interval]");
  console.log("   hangout [f] [d] [m]        " + "Records event with [friend] on [date] with [memo]");
  console.log("   history [?friend]          " + "See history of all friends or specific [friend]");
}

function fail(msg) {
  throw msg;
}

function showHistory(friendName) {
  if (friendName == "--chronological") {
    return showChronologicalHistory();
  }
  var events = loadEventsData();
  var eventsByFriend = _.groupBy(events, "name");
  var perFriend = function(friend) {
    prettyPrintFriendHeader(friend);
    _.sortBy(eventsByFriend[friend], "date").reverse().map(prettyPrintEventNameless);
    console.log();
  }
  if (friendName) {
    perFriend(friendName);
  } else {
    Object.keys(eventsByFriend).sort().forEach(perFriend);
  }
}

function showChronologicalHistory() {
  var events = loadEventsData();
  _.sortBy(events, "date").reverse().map(prettyPrintEvent);
}

function prettyPrintEvent(event) {
  console.log(event.date + " \t" + event.name + " \t" + event.memo);
}

function prettyPrintFriendHeader(friend) {
  console.log(friend);
  console.log("-".repeat(friend.length));
}

function prettyPrintEventNameless(event) {
  console.log(event.date + "  " + event.memo);
}

// Default behavior
var callDefault = listFriends;

// figure out which command you're running
function main() {
  var args = process.argv.slice(2);
  if (0 === args.length) {
    callDefault();
  } else if (2 === args.length && "add" === args[0]) {
    addFriend(args[1]);
  } else if (3 === args.length && "add" === args[0]) {
    addFriend(args[1], args[2]);
  } else if (1 === args.length && "list" === args[0]) {
    listFriends();
  } else if (2 === args.length && "list" === args[0]) {
    listFriend(args[1]);
  } else if (3 === args.length && "edit" === args[0]) {
    editFriend(args[1], args[2]);
  } else if (1 === args.length && "history" === args[0]) {
    showHistory();
  } else if (2 === args.length && "history" === args[0]) {
    showHistory(args[1]);
  } else if (4 === args.length && "hangout" === args[0]) {
    addEvent(args[1], args[2], args[3]);
  } else {
    showHelp();
  }
}

main();
