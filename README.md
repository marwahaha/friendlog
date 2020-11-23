## Setup

[Install Node](https://nodejs.org/en/download/package-manager/) (if you haven't before). Then:

```
npm install -g friendlog
```

## Shortcuts

Add tab-completion and the shortcut `flh` for `fl hangout`!
```
fl shortcuts >> ~/.bash_profile && source ~/.bash_profile
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

## FAQ
> Where is my data stored?

All data is stored on your own computer.

> What qualifies as a "hangout"?

You can use any criteria you like. I recommend focusing on *interaction with intent*. You saw and respected the person as another person on Earth and grew together in some small way.

> Can you add yourself?

I (Kunal) have started to do this, logging when I do something alone and self-fulfilling (a long run, time with a good book, a fancy meal for one...) This reminds me to "hangout" with myself, too.

> I didn't understand this page but I want to try it out!

Email me at `marwahaha@berkeley.edu`.

> How can I visualize the data?

You can try using `jq` (available for [download here](https://stedolan.github.io/jq/download/)). Here's a command I like to see friends grouped by time interval:

```
jq '.|=group_by(.interval)|map({interval:.[0].interval, names:map(.name)})' < ~/.friendlog/friends.json
```

## Contributing
Linting is enforced with pre-commit and pre-push hooks. `npm run lint-fix` will help!

Publish easily: `npm version [major|minor|patch]` will bump version numbers; `npm publish` will publish package.
