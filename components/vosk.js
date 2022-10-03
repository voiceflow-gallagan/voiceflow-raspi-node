const fs = require('fs')

if (!fs.existsSync(MODEL_PATH)) {
  console.log(
    'Please download the model from https://alphacephei.com/vosk/models and unpack as ' +
      MODEL_PATH +
      ' in the current folder.'
  )
  process.exit()
}

module.exports = {
  start: () => {
    vosk.setLogLevel(0)
    var micInstance = mic({
      rate: String(SAMPLE_RATE),
      channels: '1',
      debug: false,
      device: 'default',
    })

    var micInputStream = micInstance.getAudioStream()
    micInstance.start()

    micInputStream.on('data', (data) => {
      if (rec.acceptWaveform(data)) console.log(rec.result())
      return rec.result()
      //else
      // console.log(rec.partialResult());
    })
  },
}

process.on('SIGINT', function () {
  console.log(rec.finalResult())
  console.log('\nDone')
  rec.free()
  model.free()
})
