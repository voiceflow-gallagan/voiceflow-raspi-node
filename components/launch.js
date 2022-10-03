require('dotenv').config()
const VF = require('./dmapi.js')
// LED = require('./led.js')
const Audio = require('./audio.js')

module.exports = {
  start: async (launch) => {
    isInterrupted = false
    const check = await Wakeword.detect()
    if (check == true) {
      //LED.listen()
      console.log('Wakeword detected!')
      console.log('Starting ASR')
      Audio.play()
      VF.capture(false)
    }
  },
}
