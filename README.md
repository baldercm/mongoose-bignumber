[![Build Status](https://travis-ci.org/baldercm/mongoose-bignumber.svg?branch=master)](https://travis-ci.org/baldercm/mongoose-bignumber)
[![Coverage Status](https://coveralls.io/repos/github/baldercm/mongoose-bignumber/badge.svg?branch=master)](https://coveralls.io/github/baldercm/mongoose-bignumber?branch=master)

baldercm/mongoose-bignumber
==============

Mongoose type for storing arbitrary-precision decimal numbers (using bignumber.js).

Will convert all values to String on storing and serialization to avoid precision loss.

## Installation

Install the module using npm:

```bash
npm i mongoose-bignumber
```

If you are not using mongoose and bignumber.js:

```bash
npm i mongoose bignumber.js mongoose-bignumber
```

`mongoose` and `bignumber.js` are declared as `peerDependencies`, so you have to install these dependencies yourself.

## Basic Usage

Require the module and use it in your schema:

```javascript
const mongoose        = require('mongoose')
const BigNumber       = require('bignumber.js')
const BigNumberSchema = require('mongoose-bignumber')

const exampleSchema = new mongoose.Schema({
  val1:  { type: BigNumberSchema, required: true, min: '0.00' },
  val2:  { type: BigNumberSchema, scale: 2, rounding: BigNumber.ROUND_HALF_UP },
  val3:  { type: mongoose.Schema.Types.BigNumber, max: new BigNumber('9999.99') },
})

mongoose.model('Example', exampleSchema)
```


## Options

Supports `required`, `min`, `max` validators and formats according to `scale` and `rounding` schema option.

### `scale {int}`

Sets the scale (decimal precision). Used for formatting the value when saving to MongoDB or serializing with `toJSON` or `toObject`.

### `rounding {int}`

Sets the BigNumber rounding method. [See bignumber.js docs](http://mikemcl.github.io/bignumber.js/#constructor-properties) for more details.


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
model.toJSON()  // {_id: ..., bignumber: '23.46'}
model.bignumber = model.bignumber.add('1.10')
model.toJSON()  // {_id: ..., bignumber: '24.56'}

// BigNumber instances are immutable, this won't change the model!
model.toJSON()  // {_id: ..., bignumber: '24.56'}
model.bignumber.add('10.00')
model.toJSON()  // {_id: ..., bignumber: '24.56'}
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
