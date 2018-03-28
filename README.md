This is currently very fragile. Invalid commands may break things. Be careful!

Initial state: (no friends)
```
$ friendlog
```

Add some friends: (along with how often you'd like to see them ideally (in days)
```
$ friendlog add alice 5  # your best friend
$ friendlog add bob 15   # not quite so close
$ friendlog add kunal 15
```

Log a hangout:
```
$ friendlog hangout alice 2018-01-01 "Got coffee"
$ friendlog hangout kunal 2018-02-01 "Created friendlog"
```

See who you should hang out with next and when:
```
2018-01-06  alice
2018-02-16  kunal
new         bob
```

You will need to set up an alias to get things working:
```
git clone https://github.com/marwahaha/friendlog.git
cd friendlog
alias friendlog="node $(pwd)/index.js"
```
You may prefer these aliases:
```
alias fl="friendlog"
alias flh="fl hangout"
```

Add the aliases to your profile (i.e. `~/.bash_profile`) so you always have them!

Contributing tips:
1. Make sure you lint first `npm run lint`; `npm run lint-fix` will fix many errors!