'use strict';
var moment = require('moment');
var _ = require('lodash');
const fs = require('fs');

// Constants
var DIRECTORY = process.argv[1].substring(0, process.argv[1].lastIndexOf('/') + 1);
var FRIENDS_PATH = DIRECTORY + "data/friends.json";
var EVENTS_PATH = DIRECTORY + "data/events.json";

var DATE_STORAGE_FORMAT = "YYYY-MM-DD";
var DATE_PARSE_FORMAT = "YYYY-MM-DD";
var DATE_DISPLAY_FORMAT = "YYYY-MM-DD";
var TODAY = moment().startOf('day');
var DEFAULT_NUM_DAYS = 10;

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
  var rawNewFriends = JSON.stringify(friends);
  fs.writeFileSync(FRIENDS_PATH, rawNewFriends);
}

function writeEventsData(events) {
  var rawNewEvents = JSON.stringify(events);
  fs.writeFileSync(EVENTS_PATH, rawNewEvents);
}

// Helper functions
function getFriendByUser(friends, user) {
  return _.filter(friends, friend => friend.user === user);
}

function convertDaysToNumber(days) {
  days = +days;
  if (!days || days <= 0) {
    days = DEFAULT_NUM_DAYS;
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
    var lastEvent = _.sortBy(eventsByFriend[friend.user])[0];
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
    return console.log("Friend " + user + " already exists.")
  }
  var numDays = convertDaysToNumber(days);
  friends.push({"user": user, "freq": numDays});
  writeFriendsData(friends);
}

function editUser(user, days) {
  var friends = loadFriendsData();
  var myFriend = getFriendByUser(friends, user)[0];
  if (!myFriend) {
    return console.log("Friend " + user + " does not exist.")
  }
  var numDays = convertDaysToNumber(days);
  myFriend.freq = numDays;
  writeFriendsData(friends);
}

function listUser(user) {
  var friends = loadFriendsData();
  var myFriend = getFriendByUser(friends, user)[0];
  if (!myFriend) {
    return console.log("Friend " + user + " does not exist.")
  }
  console.log(myFriend);
}

function addEvent(user, date, memo) {
  var friends = loadFriendsData();
  var events = loadEventsData();
  var isoDate = parseDate(date).format(DATE_STORAGE_FORMAT);
  events.push({"user": user, "date": isoDate, "memo": memo});
  writeEventsData(events);
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
  } else {
    date = moment(date, DATE_PARSE_FORMAT, true);
    if (!date.isValid()) {
      fail('Invalid date');
    }
  }
  return date.startOf('day');
}

function showHelp() {
}

function fail(msg) {
  throw msg;
}

// Default behavior
var callDefault = listFriends;

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
  } else if (4 === args.length && 'hangout' === args[0]) {
    addEvent(args[1], args[2], args[3]);
  } else {
    showHelp();
  }
}

main();
