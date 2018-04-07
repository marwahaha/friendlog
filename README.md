## Setup

[Install Node](https://nodejs.org/en/download/package-manager/) (if you haven't before)

```
npm install friendlog
```

## Basic Usage

```
$ fl help
```
You can use `friendlog` or `fl`.

Add friends and an ideal interval (in days) you'd like to see them:
```
$ friendlog add Alice 5  # your best friend
$ fl add "Bob Doe" 15    # not quite so close
$ fl add Kunal 10
```

Log a hangout:
```
$ fl hangout Alice 2018-01-01 "Got coffee"
$ flh Kunal 2018-03-19 "Created friendlog"
```
You may like to add `alias flh="friendlog hangout"` to your `~/.bash_profile`.

See who you should hang out with next and when:
```
$ fl list
2018-01-06  Alice
2018-03-29  Kunal
new         Bob Doe     # no hangouts logged yet
```

See history of hangouts:
```
$ fl history
Alice
-----
2018-01-06  Got coffee

Kunal
-----
2018-03-29  Created friendlog

```

## Contributing
1. Make sure you lint first `npm run lint`; `npm run lint-fix` will fix many errors!
2. `npm version [major|minor|patch]` will bump version numbers; `npm publish` will publish package.