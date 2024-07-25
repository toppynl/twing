# Twing
[![NPM version][npm-image]][npm-url] [![Build Status][build-image]][build-url] [![Coverage percentage][coveralls-image]][coveralls-url] [![Donate][donate-image]][donate-url]

First-class TypeScript and JavaScript Twig compiler

## Prerequisites

This projects needs at least **node.js 16.0.0** to run.

It is also strongly recommended to have [ts-node](https://www.npmjs.com/package/ts-node) and [One Double Zero](https://www.npmjs.com/package/one-double-zero) installed globally to ease the writing of tests and the tracking of the code coverage.

## Usage

### Installation

```shell
npm install
```

### Build the library

```shell
npm run build
```

### Build and run the test suite

```shell
npm run build:test
npm run test
```

### Build and run the test suite in a browser

```shell
npm run build:test
npm run test:browser
```

### Writing and executing tests

Assuming one want to execute the test located in `src/test/tests/integration/comparison/to-array.ts`, one would run:

```shell
ts-node src/test/tests/integration/comparison/to-array.ts
```

It is even possible - and recommended - to track the coverage while writing tests:

```shell
odz ts-node src/test/tests/integration/comparison/to-array.ts
```

Of course, it is also perfectly possible to pipe the result of the test to your favorite tap formatter:

```shell
src/test/tests/integration/comparison$ ts-node . | tap-nyan
 9   -_-_-_-_-_,------,
 0   -_-_-_-_-_|   /\_/\ 
 0   -_-_-_-_-^|__( ^ .^) 
     -_-_-_-_-  ""  "" 
  Pass!
```

## Contributing

* Fork this repository
* Code
* Implement tests using [tape](https://github.com/substack/tape)
* Issue a pull request keeping in mind that all pull requests must reference an issue in the issue queue

## License

Copyright © 2018-2023 [Eric MORAND](https://github.com/ericmorand). Released under the [2-Clause BSD License](https://github.com/ericmorand/twing/blob/master/LICENSE).

[npm-image]: https://badge.fury.io/js/twing.svg
[npm-url]: https://npmjs.org/package/twing
[build-image]: https://gitlab.com/nightlycommit/twing/badges/main/pipeline.svg
[build-url]: https://gitlab.com/nightlycommit/twing/-/pipelines
[coveralls-image]: https://coveralls.io/repos/gitlab/nightlycommit/twing/badge.svg
[coveralls-url]: https://coveralls.io/gitlab/nightlycommit/twing
[donate-image]: https://img.shields.io/badge/Donate-PayPal-green.svg
[donate-url]: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=7YZU3L2JL2KJA