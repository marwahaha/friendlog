**This is currently _very_ fragile. Invalid commands may break things. Be careful!**

### Setup

Get the code:
```
$ git clone https://github.com/marwahaha/friendlog.git
```

[Install Node](https://nodejs.org/en/download/package-manager/) (if you haven't before)

Install friendlog:
```
$ cd friendlog
$ npm install
```

Add an alias to your profile (i.e. ~/.bash_profile):
```
alias friendlog="node $(pwd)/index.js"
```

Or you may prefer these aliases:
```
alias fl="friendlog"
alias flh="fl hangout"
```

You should now be able to check usage:
```
$ friendlog --help
```

### Basic Usage

Initial state (no friends):
```
$ friendlog
```

Add some friends and the ideal frequency you'd like to see them (in days):
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

