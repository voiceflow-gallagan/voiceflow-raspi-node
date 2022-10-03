// AUDIO LIB
const PvRecorder = require('@picovoice/pvrecorder-node')
recorder = null
// WAKEWORD | ASR
const {
  Porcupine,
  BuiltinKeyword,
  getBuiltinKeywordPath,
} = require('@picovoice/porcupine-node')

// VARIABLES DECLARATIONS
let accessKey = process.env.PROCUPINE_ACCESS_KEY
isInterrupted = false
process.on('SIGINT', function () {
  isInterrupted = true
})

module.exports = {
  stop: async () => {
    recorder.release()
  },
  detect: async () => {
    isInterrupted = false

    // LED.wakeword()
    let keywordPaths = 'wakeword/Hey-Voice-flow_en_raspberry-pi_v2_1_0.ppn' // program["keyword_file_paths"];
    let keywords = undefined
    let modelFilePath = undefined
    let sensitivity = 0.9
    let audioDeviceIndex = 4
    let showAudioDevices = undefined

    let keywordPathsDefined = keywordPaths !== undefined
    let builtinKeywordsDefined = keywords !== undefined
    let showAudioDevicesDefined = showAudioDevices !== undefined

    if (showAudioDevicesDefined) {
      const devices = PvRecorder.getAudioDevices()
      for (let i = 0; i < devices.length; i++) {
        console.log(`index: ${i}, device name: ${devices[i]}`)
      }
      process.exit()
    }

    if (builtinKeywordsDefined) {
      keywordPaths = []
      for (let builtinKeyword of keywords.split(',')) {
        let keywordString = builtinKeyword.trim().toUpperCase()
        if (keywordString in BuiltinKeyword) {
          keywordPaths.push(
            getBuiltinKeywordPath(BuiltinKeyword[keywordString])
          )
        } else {
          console.error(
            `Keyword argument ${builtinKeyword} is not in the list of built-in keywords`
          )
          return
        }
      }
    }

    if (!Array.isArray(keywordPaths)) {
      keywordPaths = keywordPaths.split(',')
    }
    let keywordNames = []

    // get the 'friendly' name of the keyword instead of showing index '0','1','2', etc.
    for (let keywordPath of keywordPaths) {
      if (keywordPathsDefined && keywordPath in BuiltinKeyword) {
        console.warn(`${keywordPath}' matches a built-in keyword.`)
      }
      let keywordName = keywordPath
        .split(/[\\|\/]/)
        .pop()
        .split('_')[0]
      keywordNames.push(keywordName)
    }

    if (isNaN(sensitivity) || sensitivity < 0 || sensitivity > 1) {
      console.error('sensitivity must be a number in the range [0,1]')
      return
    }

    // apply the same sensitivity value to all wake words to make running the demo easier
    let sensitivities = []
    for (let i = 0; i < keywordPaths.length; i++) {
      sensitivities.push(sensitivity)
    }

    let handle = new Porcupine(accessKey, keywordPaths, sensitivities)
    const frameLength = handle.frameLength
    recorder = new PvRecorder(audioDeviceIndex, frameLength)

    recorder.start()
    console.log(`Using device: ${recorder.getSelectedDevice()}...`)
    console.log(`Listening for wake word(s): ${keywordNames}`)
    console.log('Press ctrl+c to exit.')

    while (!isInterrupted) {
      const pcm = await recorder.read()
      let index = handle.process(pcm)

      if (index !== -1) {
        // console.log(`Detected '${keywordNames[index]}'`);
        isInterrupted = true
        recorder.release()
        return true
      }
    }
    console.log('')
    console.log('Stopping wakeword detection...')
    recorder.release()
    return 'end'
  },
}
