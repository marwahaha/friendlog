'use strict';
var moment = require('moment');
var _ = require('lodash');
const fs = require('fs');

var FRIENDS_PATH = "data/friends.json"; // TODO need path here
var EVENTS_PATH = "data/events.json"; // TODO need path here

var today = moment().startOf('day');

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

// API
function listFriends() {
  var events = loadEventsData();
  var friends = loadFriendsData();

  var eventsByFriend = _.groupBy(events, 'user');
  var nextEventByFriend = _.map(friends, friend => {
    var lastEvent = _.sortBy(eventsByFriend[friend.name])[0];
    if (lastEvent) {
      return {
        user: friend.name,
        date: moment(lastEvent.date).add(friend.freq, 'days')
      };
    } else {
      return {
        user: friend.name,
        date: today
      };
    }
  });
  _.sortBy(nextEventByFriend, 'date').forEach(friend => {
    console.log(friend.user + '\t' + friend.date.format('MM-DD'));
  });
}

function addUser(user, days) {
  // TODO Handle duplicate names
  days = +days;
  if (!days || days <= 0) {
    days = DEFAULT_NUM_DAYS;
  }
  var friends = loadFriendsData();
  friends.push({"name": user, "freq": days});
  writeFriendsData(friends);
}

function addEvent(user, date, memo) {
  // TODO handle error cases from function
  var friends = loadFriendsData();
  // TODO check if friend exists?
  var events = loadEventsData();
  var iso_date = moment(date).format("YYYY-MM-DD");
  events.push({"user": user, "date": iso_date, "memo": memo});
  writeEventsData(events);
}

function showHelp() {
}

// Default behavior
var callDefault = listFriends;
var DEFAULT_NUM_DAYS = 10;

// figure out which command you're running
function main() {
  var args = process.argv.slice(2);
  if (0 === args.length) {
    callDefault();
  } else if (2 === args.length && 'add' === args[0]) {
    addUser(args[1]);
  } else if (3 === args.length && 'add' === args[0]) {
    addUser(args[1], args[2]);
  } else if (4 === args.length && 'hang' === args[0]) {
    addEvent(args[1], args[2], args[3]);
  } else {
    showHelp();
  }
}

main();
