'use strict';
var moment = require('moment');
var _ = require('lodash');
const fs = require('fs');

// Constants
var DIRECTORY = process.argv[1].substring(0, process.argv[1].lastIndexOf('/') + 1);
var FRIENDS_PATH = DIRECTORY + "data/friends.json";
var EVENTS_PATH = DIRECTORY + "data/events.json";
var CONFIG_PATH = DIRECTORY + "config.json";

var DATE_STORAGE_FORMAT = "YYYY-MM-DD";
var DATE_PARSE_FORMAT = "YYYY-MM-DD";
var DATE_DISPLAY_FORMAT = "YYYY-MM-DD";
var TODAY = moment().startOf('day');
var DEFAULT_NUM_DAYS = 10;

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
  } else {
    return JSON.stringify(jsonObject);
  }
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
function getFriendByUser(friends, user) {
  return _.filter(friends, friend => friend.user === user);
}

function convertDaysToNumber(days) {
  var numDays = +days;
  if (!numDays || numDays <= 0) {
    fail("Please use a positive number of days (specified '" + days + "')");
  }
  return days;
}

// Public API
function listFriends() {
  var NEW_INDICATOR = "new       ";

  var events = loadEventsData();
  var friends = loadFriendsData();

  var eventsByFriend = _.groupBy(events, 'user');
  var nextEventByFriend = _.map(friends, friend => {
    var lastEvent = _.sortBy(eventsByFriend[friend.user], 'date').reverse()[0];
    return {
      user: friend.user,
      date: lastEvent ? moment(lastEvent.date).add(friend.freq, 'days').format(DATE_DISPLAY_FORMAT) : NEW_INDICATOR
    };
  });
  _.sortBy(nextEventByFriend, 'date').forEach(friend => {
    console.log(friend.date + '  ' + friend.user);
  });
}

function addUser(user, days) {
  var friends = loadFriendsData();
  var myFriend = getFriendByUser(friends, user)[0];
  if (!!myFriend) {
    fail("Friend " + user + " already exists")
  }
  var numDays = days !== undefined ? convertDaysToNumber(days) : DEFAULT_NUM_DAYS;
  friends.push({"user": user, "freq": numDays});
  writeFriendsData(friends);
  console.info("Added friend " + user);
}

function editUser(user, days) {
  var friends = loadFriendsData();
  var myFriend = getFriendByUser(friends, user)[0];
  if (!myFriend) {
    fail("Friend " + user + " does not exist")
  }
  var numDays = convertDaysToNumber(days);
  var oldNumDays = myFriend.freq;
  myFriend.freq = numDays;
  writeFriendsData(friends);
  console.info("Friend " + user + " now at " + numDays + " days (was " + oldNumDays + ")");
}

function listUser(user) {
  var friends = loadFriendsData();
  var myFriend = getFriendByUser(friends, user)[0];
  if (!myFriend) {
    fail("Friend " + user + " does not exist");
  }
  console.log(myFriend);
}

function addEvent(user, date, memo) {
  var friends = loadFriendsData();
  var myFriend = getFriendByUser(friends, user)[0];
  if (!myFriend) {
    fail("Friend " + user + " does not exist");
  }
  var events = loadEventsData();
  var isoDate = parseDate(date).format(DATE_STORAGE_FORMAT);
  events.push({"user": user, "date": isoDate, "memo": memo});
  writeEventsData(events);
  console.info("Added event '" + memo + "' on " + isoDate + " with " + user);
}

/**
 * Returns a Moment.
 */
function parseDate(s) {
  var date;
  if (s === 'today') {
    date = moment();
  } else if (s === 'yesterday' || s === 'yday') {
    date = moment().subtract(1, 'days');
  } else if (parseWeekday(s)) {
    date = parseWeekday(s);
  } else {
    date = moment(date, DATE_PARSE_FORMAT, true);
    if (!date.isValid()) {
      fail("Invalid date (specified '" + s + "')");
    }
  }
  return date.startOf('day');
}

function parseWeekday(s) {
  const weekdays = [
    ['sunday',    'sun'],
    ['monday',    'mon'],
    ['tuesday',   'tue'],
    ['wednesday', 'wed'],
    ['thursday',  'thu'],
    ['friday',    'fri'],
    ['saturday',  'sat'],
  ];
  for (let i = 1; i <= 7; i++) {
    const d = moment().startOf('day').subtract(i, 'days');
    if (weekdays[d.day()].indexOf(s) !== -1) {
      return d;
    }
  }
  return false;
}

function showHelp() {
  console.log("welcome to friendlog :-)")
  console.log("   add [friend] [freq=10] " + "Adds [friend]. Events expected every [freq] days")
  console.log("   list                   " + "Lists each friend and their next expected event")
  console.log("   list [friend]          " + "View info about [friend]")
  console.log("   edit [friend] [freq]   " + "Edits [friend]'s expected [freq]")
  console.log("   hangout [f] [d] [m]    " + "Records event with [friend] on [date] with [memo]")
}

function fail(msg) {
  throw msg;
}

function showHistory(user) {
  var events = loadEventsData();
  var eventsByFriend = _.groupBy(events, 'user');
  Object.keys(eventsByFriend).forEach(friend => {
    if (!user || user === friend) {
      prettyPrintFriendHeader2(friend);
      _.sortBy(eventsByFriend[friend], 'date').reverse().map(prettyPrintEvent);
    }
  })
}

function prettyPrintFriendHeader2(friend) {
  var LENGTH = 30;
  console.log("+".repeat(LENGTH));
  console.log(friend);
  console.log("-".repeat(LENGTH));
}

function prettyPrintFriendHeader(friend) {
  console.log();
  console.log(friend);
  console.log("-".repeat(friend.length));
}

function prettyPrintEvent(event) {
  console.log(event.date + '  ' + event.memo);
}

// Default behavior
var callDefault = showHelp;

// figure out which command you're running
function main() {
  var args = process.argv.slice(2);
  if (0 === args.length) {
    callDefault();
  } else if (2 === args.length && 'add' === args[0]) {
    addUser(args[1]);
  } else if (3 === args.length && 'add' === args[0]) {
    addUser(args[1], args[2]);
  } else if (1 === args.length && 'list' === args[0]) {
    listFriends();
  } else if (2 === args.length && 'list' === args[0]) {
    listUser(args[1]);
  } else if (3 === args.length && 'edit' === args[0]) {
    editUser(args[1], args[2]);
  } else if (1 === args.length && 'history' === args[0]) {
    showHistory();
    } else if (2 === args.length && 'history' === args[0]) {
    showHistory(args[1]);
  } else if (4 === args.length && 'hangout' === args[0]) {
    addEvent(args[1], args[2], args[3]);
  } else {
    showHelp();
  }
}

main();
