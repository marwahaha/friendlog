'use strict';
var moment = require('moment');
const fs = require('fs');

var FRIENDS_PATH = "data/friends.json"; // TODO need path here
var EVENTS_PATH = "data/events.json"; // TODO need path here

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
  var friends = loadFriendsData();
  console.log(friends);
}

function addUser(user, days) {
  // TODO Handle duplicate names
  days = +days;
  if (!days || days <= 0) {
    days = DEFAULT_NUM_DAYS;
  }
  var friends = loadFriendsData();
  friends.push({"name": user, "days": days});
  writeFriendsData(friends);
}

function addEvent(user, date, memo) {
  // TODO handle error cases from function
  var friends = loadFriendsData();
  if (!friends[user]) {
    // TODO cause an error
    return;
  }
  var events = loadEventsData();
  iso_date = moment(date).format("YYYY-MM-DD");
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
