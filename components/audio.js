var exec = require('child_process').exec

module.exports = {
  play: async (name) => {
    if (!name) {
      const execSync = require('child_process').execSync
      const result = execSync('aplay ~/voiceflow-raspi/audios/beepbeep.wav')
    } else {
      const execSync = require('child_process').execSync
      const result = execSync(`mpg321 ~/voiceflow-raspi/audios/${name}.mp3`)
    }
  },
}
