'use strict'

const Bluebird        = require('bluebird')
const BigNumber       = require('bignumber.js')
const mongoose        = require('mongoose')
const chai            = require('chai')
const expect          = chai.expect
const BigNumberSchema = require('../')

describe('BigNumberSchema', () => {

  before(() => {
    mongoose.Promise = Bluebird
    return mongoose.connect('mongodb://localhost:27017/test')
  })

  after(() => {
    return mongoose.disconnect()
  })

  before(() => {
    mongoose.model('Test', {
      value:        { type: BigNumberSchema, required: true },
      nullable:     { type: BigNumberSchema, required: false },
      minString:    { type: BigNumberSchema, min: '10' },
      minNumber:    { type: BigNumberSchema, min: 10 },
      minBigNumber: { type: BigNumberSchema, min: new BigNumber('10') },
      maxString:    { type: BigNumberSchema, max: '10' },
      maxNumber:    { type: BigNumberSchema, max: 10 },
      maxBigNumber: { type: BigNumberSchema, max: new BigNumber('10') },
      scale:        { type: BigNumberSchema, scale: 2 },
      rounding:     { type: BigNumberSchema, rounding: BigNumber.HALF_DOWN },
    })
  })

  beforeEach(() => {
    const Test = mongoose.model('Test')

    return Test.deleteOne()
  })

  describe('cast', () => {
    it('should fail on non valid types', () => {
      const Test = mongoose.model('Test')


      return Test.create({value: {invalid: 'type'}})
        .then(() => {throw new Error('ValidationError expected')})
        .catch((err) => {
          expect(err).to.have.property('name', 'ValidationError')
          expect(err).to.have.property('message', 'Test validation failed: value: Cast to BigNumberSchema failed for value "{ invalid: \'type\' }" (type Object) at path "value"')
        })
    })

    it('should be cast from String', () => {
      const Test = mongoose.model('Test')

      return Test.create({value: '5'})
    })

    it('should be cast from Number', () => {
      const Test = mongoose.model('Test')

      return Test.create({value: 5})
    })

    it('should be cast from BigNumber', () => {
      const Test = mongoose.model('Test')

      return Test.create({value: new BigNumber('5')})
    })

    it('should be cast from BigNumberSchema', () => {
      const Test = mongoose.model('Test')

      let test = new Test({value: new BigNumber('5')})
      new Test({value: test.value})
    })

    it('should be cast from null', () => {
      const Test = mongoose.model('Test')

      let test = new Test({value: 5, nullable: null})
      expect(test).to.have.property('nullable', null)
    })

    it('should be cast from empty string', () => {
      const Test = mongoose.model('Test')

      let test = new Test({value: 5, nullable: ''})
      expect(test).to.have.property('nullable', null)
    })
  })

  describe('BigNumber inheritance', () => {
    it('should build BigNumber instances on documents', () => {
      const Test = mongoose.model('Test')

      return Test.create({value: 5})
        .then(() => Test.findOne())
        .then((test) => {
          expect(test).to.have.property('value').that.is.an.instanceof(BigNumber)
        })
    })

    it('should be able to perform BigNumber calculations', () => {
      const Test = mongoose.model('Test')

      return Test.create({value: 5})
        .then((test) => {
          test.value = test.value.plus(3)
          return test.save()
        })
        .then((test) => {
          expect(test.value.isEqualTo(new BigNumber(8))).to.be.true
        })
    })
  })

  describe('String representation', () => {
    it('should be casted to String when saving to MongoDB', () => {
      const Test = mongoose.model('Test')

      return Test.create({value: 5})
        .then(() => Test.findOne().lean())
        .then((test) => {
          expect(test).to.have.property('value', '5')
        })
    })

    it('should be casted to String when serializing toObject', () => {
      const Test  = mongoose.model('Test')
      let test    = new Test({value: 5})
      let obj     = test.toObject()

      expect(obj).to.have.property('value', '5')
    })

    it('should be casted to String when serializing toJSON', () => {
      const Test  = mongoose.model('Test')
      let test    = new Test({value: 5})
      let json    = test.toJSON()

      expect(json).to.have.property('value', '5')
    })
  })

  describe('validators', () => {
    describe('required', () => {
      it('should fail on missing required field', () => {
        const Test = mongoose.model('Test')

        return Test.create({value: null})
          .then(() => {throw new Error('ValidationError expected')})
          .catch((err) => {
            expect(err).to.have.property('name', 'ValidationError')
            expect(err).to.have.property('message', 'Test validation failed: value: Path `value` is required.')
          })
      })

      it('should pass on present required field', () => {
        const Test = mongoose.model('Test')

        return Test.create({value: 5})
      })
    })
    describe('min', () => {
      it('should fail on value less than min (number)', () => {
        const Test = mongoose.model('Test')

        return Test.create({minNumber: 9, value: 5})
          .then(() => {throw new Error('ValidationError expected')})
          .catch((err) => {
            expect(err).to.have.property('name', 'ValidationError')
            expect(err).to.have.property('message', 'Test validation failed: minNumber: Path `minNumber` (9) is less than minimum allowed value (10).')
          })
      })

      it('should fail on value less than min (string)', () => {
        const Test = mongoose.model('Test')

        return Test.create({minString: 9, value: 5})
          .then(() => {throw new Error('ValidationError expected')})
          .catch((err) => {
            expect(err).to.have.property('name', 'ValidationError')
            expect(err).to.have.property('message', 'Test validation failed: minString: Path `minString` (9) is less than minimum allowed value (10).')
          })
      })

      it('should fail on value less than min (BigNumber)', () => {
        const Test = mongoose.model('Test')

        return Test.create({minBigNumber: 9, value: 5})
          .then(() => {throw new Error('ValidationError expected')})
          .catch((err) => {
            expect(err).to.have.property('name', 'ValidationError')
            expect(err).to.have.property('message', 'Test validation failed: minBigNumber: Path `minBigNumber` (9) is less than minimum allowed value (10).')
          })
      })

      it('should pass on value equal to min', () => {
        const Test = mongoose.model('Test')

        return Test.create({minString: 10, value: 5})
      })

      it('should pass on value greater than min', () => {
        const Test = mongoose.model('Test')

        return Test.create({minString: 50, value: 5})
      })
    })
    describe('max', () => {
      it('should fail on value greater than max (number)', () => {
        const Test = mongoose.model('Test')

        return Test.create({maxNumber: 11, value: 5})
          .then(() => {throw new Error('ValidationError expected')})
          .catch((err) => {
            expect(err).to.have.property('name', 'ValidationError')
            expect(err).to.have.property('message', 'Test validation failed: maxNumber: Path `maxNumber` (11) is more than maximum allowed value (10).')
          })
      })

      it('should fail on value greater than max (string)', () => {
        const Test = mongoose.model('Test')

        return Test.create({maxString: 11, value: 5})
          .then(() => {throw new Error('ValidationError expected')})
          .catch((err) => {
            expect(err).to.have.property('name', 'ValidationError')
            expect(err).to.have.property('message', 'Test validation failed: maxString: Path `maxString` (11) is more than maximum allowed value (10).')
          })
      })

      it('should fail on value greater than max (BigNumber)', () => {
        const Test = mongoose.model('Test')

        return Test.create({maxBigNumber: 11, value: 5})
          .then(() => {throw new Error('ValidationError expected')})
          .catch((err) => {
            expect(err).to.have.property('name', 'ValidationError')
            expect(err).to.have.property('message', 'Test validation failed: maxBigNumber: Path `maxBigNumber` (11) is more than maximum allowed value (10).')
          })
      })

      it('should pass on value equal to max', () => {
        const Test = mongoose.model('Test')

        return Test.create({maxString: 10, value: 5})
      })

      it('should pass on value less than max', () => {
        const Test = mongoose.model('Test')

        return Test.create({maxString: 5, value: 5})
      })
    })
  })

  describe('extra schema options', () => {
    describe('scale', () => {
      it('should scale the results to fixed decimal places when saving to DB', () => {
        const Test = mongoose.model('Test')

        return Test.create({scale: '1.234', value: 5})
          .then(() => Test.findOne().lean())
          .then((test) => {
            expect(test).to.have.property('scale', '1.23')
          })
      })

      it('should scale the results to fixed decimal places when serializing toObject', () => {
        const Test  = mongoose.model('Test')
        let test    = new Test({scale: '1.234', value: 5})
        let obj     = test.toObject()

        expect(obj).to.have.property('scale', '1.23')
      })

      it('should scale the results to fixed decimal places when serializing toJSON', () => {
        const Test  = mongoose.model('Test')
        let test    = new Test({scale: '1.234', value: 5})
        let obj     = test.toJSON()

        expect(obj).to.have.property('scale', '1.23')
      })
    })
  })

  describe('queries', () => {
    it('should work with query with no conditional', () => {
      const Test  = mongoose.model('Test')

      return Test.create({value: 5})
        .then(() => Test.findOne({value: 5}).lean())
        .then((test) => {
          expect(test).to.exist
          expect(test).to.have.property('value', '5')
        })
    })

    it('should work with query with $eq conditional', () => {
      const Test  = mongoose.model('Test')

      return Test.create({value: 5})
        .then(() => Test.findOne({value: {$eq: 5}}).lean())
        .then((test) => {
          expect(test).to.exist
          expect(test).to.have.property('value', '5')
        })
    })

    it('should work with query with $ne conditional', () => {
      const Test  = mongoose.model('Test')

      return Test.create({value: 5})
        .then(() => Test.findOne({value: {$ne: 5}}).lean())
        .then((test) => {
          expect(test).to.not.exist
        })
    })

    it('should work with query with $gt conditional', () => {
      const Test  = mongoose.model('Test')

      return Test.create({value: 5})
        .then(() => Test.findOne({value: {$gt: 4}}).lean())
        .then((test) => {
          expect(test).to.exist
          expect(test).to.have.property('value', '5')
        })
    })

    it('should work with query with $gte conditional', () => {
      const Test  = mongoose.model('Test')

      return Test.create({value: 5})
        .then(() => Test.findOne({value: {$gte: 5}}).lean())
        .then((test) => {
          expect(test).to.exist
          expect(test).to.have.property('value', '5')
        })
    })

    it('should work with query with $lt conditional', () => {
      const Test  = mongoose.model('Test')

      return Test.create({value: 5})
        .then(() => Test.findOne({value: {$lt: 6}}).lean())
        .then((test) => {
          expect(test).to.exist
          expect(test).to.have.property('value', '5')
        })
    })

    it('should work with query with $lte conditional', () => {
      const Test  = mongoose.model('Test')

      return Test.create({value: 5})
        .then(() => Test.findOne({value: {$lte: 5}}).lean())
        .then((test) => {
          expect(test).to.exist
          expect(test).to.have.property('value', '5')
        })
    })

    it('should work with query with $in conditional', () => {
      const Test  = mongoose.model('Test')

      return Test.create({value: 5})
        .then(() => Test.findOne({value: {$in: [4, 5, 6]}}).lean())
        .then((test) => {
          expect(test).to.exist
          expect(test).to.have.property('value', '5')
        })
    })

    it('should work with query with $in conditional (cast array)', () => {
      const Test  = mongoose.model('Test')

      return Test.create({value: 5})
        .then(() => Test.findOne({value: {$in: 5}}).lean())
        .then((test) => {
          expect(test).to.exist
          expect(test).to.have.property('value', '5')
        })
    })

    it('should work with query with $nin conditional', () => {
      const Test  = mongoose.model('Test')

      return Test.create({value: 5})
        .then(() => Test.findOne({value: {$nin: [4, 5, 6]}}).lean())
        .then((test) => {
          expect(test).to.not.exist
        })
    })

    it('should work with query with $nin conditional (cast array)', () => {
      const Test  = mongoose.model('Test')

      return Test.create({value: 5})
        .then(() => Test.findOne({value: {$nin: 5}}).lean())
        .then((test) => {
          expect(test).to.not.exist
        })
    })

    it('should throw error on non supported conditional', () => {
      const Test  = mongoose.model('Test')

      return Test.findOne({value: {$size: 1}}).lean()
        .then(() => {throw new Error('ValidationError expected')})
        .catch((err) => {
          expect(err).to.have.property('name', 'Error')
          expect(err).to.have.property('message', 'Can\'t use $size with BigNumber.')
        })
    })
  })

})
