## Setup

[Install Node](https://nodejs.org/en/download/package-manager/) (if you haven't before)

```
npm install -g friendlog
```

## Tips
Add a handy alias and autocomplete to your `~/.bash_profile`:
```
alias flh="friendlog hangout"
source fl-completion-setup
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
NAME    DATE        MEMO
Alice   2018-01-06  Got coffee
Kunal   2018-03-29  Created friendlog
```

See info about friend:
```
$ fl info Kunal
{ name: 'Kunal', interval: 10 }
```

## Contributing
Linting is enforced with pre-commit and pre-push hooks. `npm run lint-fix` will help!

Publish easily: `npm version [major|minor|patch]` will bump version numbers; `npm publish` will publish package.
