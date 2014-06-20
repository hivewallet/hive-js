var convert = require('../index')

describe('convert', function(){
  describe('btcToSatoshi', function(){
    it('works for 0', function(){
      expect(convert.btcToSatoshi(0)).toEqual(0)
    })

    it('works for non-zero', function(){
      expect(convert.btcToSatoshi(1)).toEqual(100000000)
      expect(convert.btcToSatoshi(0.005)).toEqual(500000)
      expect(convert.btcToSatoshi(0.009)).toEqual(900000)
    })

    it('returns undefined for empty value', function(){
      expect(convert.btcToSatoshi()).toEqual(undefined)
      expect(convert.btcToSatoshi(null)).toEqual(undefined)
      expect(convert.btcToSatoshi('')).toEqual(undefined)
    })
  })

  describe('satoshiToBtc', function(){
    it('works for 0', function(){
      expect(convert.satoshiToBtc(0)).toEqual(0)
    })

    it('works for non-zero', function(){
      expect(convert.satoshiToBtc(12345)).toEqual(0.00012345)
      expect(convert.satoshiToBtc(123456789)).toEqual(1.23456789)
    })

    it('returns undefined for empty value', function(){
      expect(convert.satoshiToBtc()).toEqual(undefined)
      expect(convert.satoshiToBtc(null)).toEqual(undefined)
      expect(convert.satoshiToBtc('')).toEqual(undefined)
    })
  })
})
