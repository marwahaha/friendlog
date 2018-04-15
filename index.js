#!/usr/bin/env node
"use strict";
var moment = require("moment");
var _ = require("lodash");
var fs = require("fs");
var os = require("os");
var rl = require("readline");
var argv = require("minimist")(process.argv.slice(2));
var columnify = require("columnify");

// Constants
var FL_DIRECTORY = os.homedir() + "/.friendlog/";
var FRIENDS_PATH = FL_DIRECTORY + "friends.json";
var EVENTS_PATH = FL_DIRECTORY + "events.json";
var CONFIG_PATH = FL_DIRECTORY + "config.json";

var DATE_STORAGE_FORMAT = "YYYY-MM-DD";
var DATE_PARSE_FORMAT = "YYYY-MM-DD";
var DATE_DISPLAY_FORMAT = "YYYY-MM-DD";
var TODAY = moment().startOf("day");
var DEFAULT_NUM_DAYS = 10;

// Config
var config = loadConfigData();

// Setup
try {
  loadFriendsData();
  loadEventsData();
} catch (err) {
  console.log("Setting up friendlog! :-)");
  fs.existsSync(FL_DIRECTORY) || fs.mkdirSync(FL_DIRECTORY);
  fs.existsSync(CONFIG_PATH) || ((config = JSON.stringify({"prettyPrintJson": true})) && writeConfigData());
  fs.existsSync(FRIENDS_PATH) || writeFriendsData([]);
  fs.existsSync(EVENTS_PATH) || writeEventsData([]);
}

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

function writeConfigData() {
  fs.writeFileSync(CONFIG_PATH, stringify(config));
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

function ifYesAddFriend(answer, name, callback) {
  if (-1 !== ["y", "yes", "Y", "YES"].indexOf(answer)) {
    addFriend(name);
    return callback();
  }
  fail("Friend " + name + " does not exist");
}

function getFriendByName(friends, name) {
  return _.filter(friends, friend => friend.name === name);
}

function fail(msg) {
  throw msg;
}

// Date-related helpers
function convertDaysToNumber(days) {
  var numDays = +days;
  if (!numDays || numDays <= 0) {
    fail("Please use a positive number of days (specified '" + days + "')");
  }
  return days;
}

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
  var newFriends =    _.filter(nextEventByFriend, x => x.date === NEW_INDICATOR);
  var nonNewFriends = _.filter(nextEventByFriend, x => x.date !== NEW_INDICATOR);
  _.sortBy(nonNewFriends, "date").forEach(displayFriend);
  _.sortBy(newFriends, "name").forEach(displayFriend);
}

function displayFriend(friend) {
  const today = TODAY.format(DATE_DISPLAY_FORMAT); // TODO - what if date display format is not Year, Month, Day?
  const dateColumn = friend.date + (friend.date < today ? "*" : " ");
  console.log(dateColumn + " " + friend.name);
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

function getFriendInfo(name) {
  var friends = _.sortBy(loadFriendsData(), "name");
  if (!name) {
    return (argv.n || argv.names)
      ? friends.map(f => console.log(f.name))
      : friends.map(f => console.log(f));
  }
  var myFriend = getFriendByName(friends, name)[0];
  if (!myFriend) {
    return ask(
      "New friend " + name + "! Add them to friendlog? [yN]",
      (answer) => ifYesAddFriend(answer, name, () => getFriendInfo(name))
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

function addTags(friendName, tags) {
  var friends = loadFriendsData();
  var myFriend = getFriendByName(friends, friendName)[0];
  if (!myFriend) {
    return ask(
      "New friend " + friendName + "! Add them to friendlog? [yN]",
      (answer) => ifYesAddFriend(answer, friendName, () => addTags(friendName, tags))
    );
  }
  myFriend.tags = myFriend.tags || [];
  var addedTags = _.difference(tags, myFriend.tags);
  myFriend.tags = myFriend.tags.concat(addedTags);
  writeFriendsData(friends);
  console.info("Added " + addedTags.length + " new tags to friend " + friendName
    + ": [" + addedTags.toString() + "]");
}

function removeTags(friendName, tags) {
  var friends = loadFriendsData();
  var myFriend = getFriendByName(friends, friendName)[0];
  if (!myFriend) {
    return ask(
      "New friend " + friendName + "! Add them to friendlog? [yN]",
      (answer) => ifYesAddFriend(answer, friendName, () => removeTags(friendName, tags))
    );
  }
  myFriend.tags = myFriend.tags || [];
  var oldTags = myFriend.tags;
  myFriend.tags = (argv.a || argv.all) ? [] : _.difference(myFriend.tags, tags);
  var removedTags = _.difference(oldTags, myFriend.tags);
  writeFriendsData(friends);
  console.info("Removed " + removedTags.length + " tags from friend " + friendName
    + ": [" + removedTags.toString() + "]");
}

function showHelp() {
  console.log("welcome to friendlog :-)");
  console.log("   add [friend] [interval=10] " + "Adds [friend]. Events expected every [interval] days");
  console.log("   list                       " + "Lists each friend and their next expected event");
  console.log("   info [-n]                  " + "View info or just [-names] of each friend");
  console.log("   info [friend]              " + "View info about [friend]");
  console.log("   edit [friend] [interval]   " + "Edits [friend]'s expected [interval]");
  console.log("   hangout [f] [d] [m]        " + "Records event with [friend] on [date] with [memo]");
  console.log("   history [-c]               " + "See history, grouped by friend or [-chronological]");
  console.log("   history [friend]           " + "See history with specific friend");
  console.log("   tag [friend] [...tags]     " + "Add any number of [tags] to a friend");
  console.log("   untag [friend] [...t] [-a] " + "Remove specific [tags] or [-all] tags from a friend");
}

function showHistory(friendName) {
  var events = loadEventsData();
  if (friendName) {
    events = _.filter(events, e => e.name === friendName);
  }
  if (argv.c || argv.chronological) {
    events = _.orderBy(events, ["date", "memo", "name"], ["desc", "asc", "asc"]);
  } else {
    events = _.orderBy(events, ["name", "date", "memo"], ["asc", "desc", "asc"]);
  }
  return console.log(columnify(events));
}

// Default behavior
var callDefault = listFriends;

// figure out which command you're running
function main() {
  var args = argv._;
  if (0 === args.length) {
    callDefault();
  } else if (2 === args.length && "add" === args[0]) {
    addFriend(args[1]);
  } else if (3 === args.length && "add" === args[0]) {
    addFriend(args[1], args[2]);
  } else if (1 === args.length && "list" === args[0]) {
    listFriends();
  } else if (1 === args.length && "info" === args[0]) {
    getFriendInfo();
  } else if (2 === args.length && "info" === args[0]) {
    getFriendInfo(args[1]);
  } else if (3 === args.length && "edit" === args[0]) {
    editFriend(args[1], args[2]);
  } else if (1 === args.length && "history" === args[0]) {
    showHistory();
  } else if (2 === args.length && "history" === args[0]) {
    showHistory(args[1]);
  } else if (4 === args.length && "hangout" === args[0]) {
    addEvent(args[1], args[2], args[3]);
  } else if (3 <= args.length && "tag" === args[0]) {
    addTags(args[1], args.slice(2));
  } else if (3 <= args.length && "untag" === args[0]) {
    removeTags(args[1], args.slice(2));
  } else if (2 === args.length && (argv.a || argv.all)) {
    removeTags(args[1], args.slice(2));
  } else {
    showHelp();
  }
}

main();
