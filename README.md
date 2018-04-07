**This is somewhat fragile. Invalid commands may break things.**

### Setup

1. Get the code:
```
$ git clone https://github.com/marwahaha/friendlog.git
```

2. [Install Node](https://nodejs.org/en/download/package-manager/) (if you haven't before)

3. Install friendlog and set up `data` files:
```
$ cd friendlog
$ npm install
$ npm run reset
```

4a. Add an alias to your profile (i.e. ~/.bash_profile):
```
alias friendlog="node $(pwd)/index.js"
```

4b. You may also like these aliases:
```
alias fl="friendlog"
alias flh="fl hangout"
```

5. You're all set!
```
$ friendlog help
```

### Basic Usage

Initial state (no friends):
```
$ friendlog
```

Add friends and an ideal interval (in days) you'd like to see them:
```
$ friendlog add Alice 5  # your best friend
$ friendlog add "Bob Doe" 15   # not quite so close
$ friendlog add Kunal 10
```

Log a hangout:
```
$ friendlog hangout alice 2018-01-01 "Got coffee"
$ friendlog hangout kunal 2018-03-19 "Created friendlog"
```

See who you should hang out with next and when:
```
$ friendlog list
2018-01-06  Alice
2018-03-29  Kunal
new         Bob Doe     # no hangouts logged yet
```

### Contributing tips:
1. Make sure you lint first `npm run lint`; `npm run lint-fix` will fix many errors!
