var validate = require('../index')

describe('pin validator', function(){
  it('returns false if undefined', function(){
    expect(validate()).toBeFalsy()
  })

  it('returns false for empty string', function(){
    expect(validate('')).toBeFalsy()
  })

  it('returns false if not a number', function(){
    expect(validate('aaaa')).toBeFalsy()
  })

  it('returns false if less than 4 digits', function(){
    expect(validate('111')).toBeFalsy()
  })

  it('returns false if more than 4 digits', function(){
    expect(validate('11111')).toBeFalsy()
  })

  it('returns true if valid', function(){
    expect(validate('1111')).toBeTruthy()
  })

  describe('when allow blank flag is turned on', function(){
    it('returns true for empty string', function(){
      expect(validate('', true)).toBeTruthy()
    })

    it('returns true for undefined', function(){
      expect(validate(undefined, true)).toBeTruthy()
    })
  })
})
