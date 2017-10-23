'use strict'

const BigNumber     = require('bignumber.js')
const mongoose      = require('mongoose')
const SchemaType    = mongoose.SchemaType
const CastError     = SchemaType.CastError
const MongooseError = mongoose.Error

class BigNumberType extends BigNumber {
  constructor(value, {scale = 0, rounding = BigNumber.ROUND_HALF_UP} = {}) {
    super(String(value))
    this.scale    = scale
    this.rounding = rounding
  }

  valueOf() {
    return this.toFixed(this.scale, this.rounding)
  }
}

class BigNumberSchema extends SchemaType {
  constructor(key, options) {
    super(key, options, 'BigNumberSchema')
  }

  checkRequired(value) {
    return value != null && value instanceof BigNumberType
  }

  cast(value) {
    if (value == null) {
      return value
    }
    if ('' === value) {
      return null
    }
    if (value instanceof BigNumberType) {
      return value
    }
    if (value instanceof BigNumber || typeof value === 'string' || typeof value === 'number') {
      try {
        return new BigNumberType(value, this.options)
      } catch (e) {
        throw new CastError('BigNumberSchema', value, this.path)
      }
    }

    throw new CastError('BigNumberSchema', value, this.path)
  }

  min(value, message) {
    if (this.minValidator) {
      this.validators = this.validators.filter(function(v) {
        return v.validator !== this.minValidator
      }, this)
    }

    if (value != null) {
      var msg = message || MongooseError.messages.Number.min
      msg = msg.replace(/{MIN}/, this.cast(value).valueOf())

      this.minValidator = function(v) {
        return v == null || v.gte(value)
      }

      this.validators.push({
        validator: this.minValidator,
        message: msg,
        type: 'min'
      })
    }

    return this
  }

  max(value, message) {
    if (this.maxValidator) {
      this.validators = this.validators.filter(function(v) {
        return v.validator !== this.maxValidator
      }, this)
    }

    if (value != null) {
      var msg = message || MongooseError.messages.Number.max
      msg = msg.replace(/{MAX}/, this.cast(value).valueOf())

      this.maxValidator = function(v) {
        return v == null || v.lte(value)
      }

      this.validators.push({
        validator: this.maxValidator,
        message: msg,
        type: 'max'
      })
    }

    return this
  }

  castForQuery($conditional, val) {
    if (arguments.length === 2) {
      let handler = this.$conditionalHandlers[$conditional]
      if (!handler) {
        throw new Error(`Can't use ${$conditional} with BigNumber.`)
      }
      val = handler.call(this, val)
    } else {
      val = $conditional
      val = this._castForQuery(val)
    }

    return val ? val.valueOf() : val
  }
}

function handleSingle(val) {
  return this.cast(val)
}

function handleArray(val) {
  if (!Array.isArray(val)) {
    return [this.castForQuery(val)]
  }

  return val.map((m) => {
    return this.castForQuery(m)
  })
}

BigNumberSchema.prototype.$conditionalHandlers = {
  '$lt':  handleSingle,
  '$lte': handleSingle,
  '$gt':  handleSingle,
  '$gte': handleSingle,
  '$eq':  handleSingle,
  '$ne':  handleSingle,
  '$in':  handleArray,
  '$nin': handleArray,
  '$mod': handleArray,
  '$all': handleArray,
}
BigNumberSchema.schemaName  = 'BigNumber'
BigNumberSchema.instance    = 'BigNumber'
BigNumberSchema['default']  = BigNumberSchema

mongoose.Schema.Types.BigNumber = BigNumberSchema
mongoose.Types.BigNumber        = BigNumberType

module.exports = BigNumberSchema
