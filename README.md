[![Build Status](https://travis-ci.org/baldercm/mongoose-bignumber.svg?branch=master)](https://travis-ci.org/baldercm/mongoose-bignumber)
[![Coverage Status](https://coveralls.io/repos/github/baldercm/mongoose-bignumber/badge.svg?branch=master)](https://coveralls.io/github/baldercm/mongoose-bignumber?branch=master)

baldercm/mongoose-bignumber
==============

Mongoose type for storing arbitrary-precision decimal numbers (using [bignumber.js](https://github.com/MikeMcl/bignumber.js)).

Use the power of `BigNumber` instances in your model and obtain seamlessly conversion to `String` values when saving to MongoDB and serializing as JSON.


## Installation

Install the module using npm:

```bash
npm i mongoose-bignumber
```

`mongoose` and `bignumber.js` are declared as `peerDependencies`, so you have to install these dependencies yourself if you are not using them yet:

```bash
npm i mongoose bignumber.js mongoose-bignumber
```


## Basic Usage

Require the module and use it in your schema:

```javascript
const mongoose        = require('mongoose')
const BigNumber       = require('bignumber.js')
const BigNumberSchema = require('mongoose-bignumber')

// you may use BigNumberSchema or mongoose.Schema.Types.BigNumber
// standard number validators work for Number, String and BigNumber values
const exampleSchema = new mongoose.Schema({
  val1:  { type: BigNumberSchema, required: true, min: '0' },
  val2:  { type: BigNumberSchema, scale: 2, rounding: BigNumber.ROUND_HALF_UP },
  val2:  { type: BigNumberSchema, scale: 2, max: new BigNumber('99.99') },
  val3:  { type: mongoose.Schema.Types.BigNumber },
})

const Example = mongoose.model('Example', exampleSchema)
```

The only overwritten method for `BigNumberSchema` that will differ from a regular `BigNumber` is `valueOf()`, that will behave like `toFixed()` using the specified `scale` and `rounding` options.

## Options

Supports `required`, `min`, `max` validators.

`scale` and `rounding` schema options will be applied when saving to MongoDB or serializing with `toJSON` or `toObject`.

### `scale {int}`

Sets the scale (decimal precision).

`scale` defaults to `0`.

### `rounding {int}`

Sets the `BigNumber` rounding method. [See bignumber.js docs](http://mikemcl.github.io/bignumber.js/#constructor-properties) for more details.

`rounding` defaults to `BigNumber.ROUND_HALF_UP`.

## Example

```javascript
const mongoose        = require('mongoose')
const BigNumber       = require('bignumber.js')
const BigNumberSchema = require('mongoose-bignumber')

const exampleSchema = new mongoose.Schema({
  bignumber: { type: BigNumberSchema, scale: 2, rounding: BigNumber.ROUND_HALF_UP },
  // will format using:    BigNumber.toFixed(2, BigNumber.ROUND_HALF_UP)
})

const Model = mongoose.model('Example', exampleSchema)

let model = new Model({bignumber: '23.456789'})
await model.save() // {_id: ..., bignumber: '23.46'}

// model.bignumber is a BigNumber instance
assert(model.bignumber instanceof BigNumber)

// and we can use it as a regular BigNumber
// {_id: ..., bignumber: '23.46'}
model.bignumber = model.bignumber.add('11.11')
// {_id: ..., bignumber: '34.57'}

// BigNumber instances are immutable, this won't change the model!
// {_id: ..., bignumber: '34.57'}
model.bignumber.add('11.11')
// {_id: ..., bignumber: '34.57'}
```


## Contributing

```bash
git clone https://github.com/baldercm/mongoose-bignumber
npm install
npm test
npm run lint
```


## License

[MIT](LICENSE)
