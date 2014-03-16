var wallet = require('../index')

describe('wallet', function() {
  describe('openWallet', function() {
    var passphrase, seed

    beforeEach(function(){
      passphrase = "soft kitten warm kitten little ball off fury happy kitten sleep kitten"
      seedHex = "0675990af86f2fbf3568b23a1ab954df2e3a9528b004f4b4e3750ea89bfddea06f20567ec4a8483858c1264ba6b33eb98203fb766a5ff8d8f392877d65127c55"
      seedBytes = [
        6, 117, 153, 10, 248, 111, 47, 191, 53, 104, 178, 58, 26, 185, 84, 223,
        46, 58, 149, 40, 176, 4, 244, 180, 227, 117, 14, 168, 155, 253, 222, 160,
        111, 32, 86, 126, 196, 168, 72, 56, 88, 193, 38, 75, 166, 179, 62, 185,
        130, 3, 251, 118, 106, 95, 248, 216, 243, 146, 135, 125, 101, 18, 124, 85
      ]
    })

    it('generate expected seed', function() {
      wallet.openWallet(passphrase)
      expect(wallet.getSeed()).toEqual(seedHex)
    })

    it('assignes the generated master key to the wallet', function(){
      spyOn(wallet, "newMasterKey")
      wallet.openWallet(passphrase, 'testnet')
      expect(wallet.newMasterKey).toHaveBeenCalledWith(seedBytes, 'testnet')
    })

    describe('sync', function(){
      it('generates addresses in batches of 5', function(){
        spyOn(wallet, 'generateAddress')

        wallet.openWallet(passphrase)

        expect(wallet.generateAddress).toHaveBeenCalled()
        expect(wallet.generateAddress.calls.count()).toEqual(5)
      })
    })
  })

});

