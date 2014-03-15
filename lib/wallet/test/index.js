var wallet = require('../index')

describe('wallet', function() {
  describe('openWallet', function() {
    it('generate expected seed', function() {
      wallet.openWallet("soft kitten warm kitten little ball off fury happy kitten sleep kitten")
      expect(wallet.getSeed()).toEqual("0675990af86f2fbf3568b23a1ab954df2e3a9528b004f4b4e3750ea89bfddea06f20567ec4a8483858c1264ba6b33eb98203fb766a5ff8d8f392877d65127c55")
    })
  })
});

