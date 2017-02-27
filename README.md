# hdash

This is an experimental project as an attempt to setup a relatively sane project structure for a
React/TypeScript application.

Run the server with:

```
$> ./server.js
```

To run unit tests:

```
$> npm test
```

## Features

* webpack
  * run `NODE_ENV=production webpack` to build minified version.
* jest
  * run `npm test`
  * _or_, `jest --watch` after `npm i -g jest`
  * _or_, using vscode (see below)
* react
* react-router
* react-bootstrap

## Visual Studio Code

Plugins that you _must_ have:

* https://marketplace.visualstudio.com/items?itemName=Orta.vscode-jest
  * Provides instant (as you save) feedback on tests in your editor using jest.
