express = require('express')
const axios = require('axios').default
const Audio = require('./audio.js')
const download = require('download')

let fs = require('fs')

// Vosk Setup
var vosk = require('vosk')
var mic = require('mic')
MODEL_PATH = 'model'
SAMPLE_RATE = 16000
const model = new vosk.Model(MODEL_PATH)
vosk.setLogLevel(0) //-1 for none
const rec = new vosk.Recognizer({ model: model, sampleRate: SAMPLE_RATE })
if (!fs.existsSync(MODEL_PATH)) {
  console.log(
    'Please download the model from https://alphacephei.com/vosk/models and unpack as ' +
      MODEL_PATH +
      ' in the current folder.'
  )
  process.exit()
}

isInterrupted = false
timeout = null

// Listen for incoming requests at /api/messages.
app.get('/api/messages', async (req, res) => {
  // Wakeword.stop()
  console.log(req.query.event)
  VF.capture('event', req.query.event)
  res.json({
    status: 'ok',
  })
})

module.exports = {
  capture: (action, event) => {
    if (action == 'launch') {
      action = ''
      Audio.play()
    }

    console.log('Starting ASR')

    micInstance = mic({
      rate: String(SAMPLE_RATE),
      channels: '1',
      debug: false,
      device: 'default',
    })
    const micInputStream = micInstance.getAudioStream()
    micInputStream.on('data', (data) => {
      if (rec.acceptWaveform(data)) {
        // LED.off()
        let query = rec.result()
        // micInstance.stop()
        if (query.text == '' && action != 'launch') {
        } else if (action == 'event' && event != '') {
        } else {
          interact(query.text, action)
        }
      } else {
        // console.log(rec.partialResult());
      }
    })

    if (action == 'event') {
      interact(event, action)
      // Audio.play();
    } else {
      // Audio.play()
      micInstance.start()
    }
  },
}

async function logger(info) {
  console.log('Logger:', info)
}

function clearNoReply() {
  console.log('No Reply Reseted')
  clearTimeout(timeout)
}

function interact(query, action) {
  clearNoReply()
  if (action != 'launch' && action != 'event') {
    micInstance.stop()
  }
  console.log('Query:', query)
  console.log('Action:', action)
  let data
  if (action == 'launch') {
    data = {
      action: {
        type: 'launch',
      },
      config: {
        tts: 'true',
      },
    }
  } else if (action == 'no-reply') {
    data = {
      action: {
        type: 'no-reply',
      },
      config: {
        tts: 'true',
      },
    }
  } else {
    data = {
      action: {
        type: 'text',
        payload: query,
      },
      config: {
        tts: 'true',
      },
    }
  }
  action = ''
  query = ''
  axios({
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    url: `https://general-runtime.voiceflow.com/state/user/${mac}/interact`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: apiKey,
      versionID: versionID,
    },
    data: data,
  })
    .then(async function (response) {
      for (let i = 0; i < response.data.length; i++) {
        if (response.data[i].type == 'speak') {
          if (response.data[i].payload.src.includes('data:audio')) {
            const buffer = Buffer.from(
              response.data[i].payload.src.split('base64,')[1],
              'base64'
            )
            fs.writeFileSync('./tmp/tmp.mp3', buffer, (err) => {
              if (err) {
                console.error('error' + err)
              }
            })
            const execSync = require('child_process').execSync
            const result = execSync('mpg321 ./tmp/tmp.mp3')
          } else {
            if (response.data[i].payload.src.includes('.wav')) {
              fs.writeFileSync(
                './tmp/tmp-audio.wav',
                await download(response.data[i].payload.src)
              )
              const execSync = require('child_process').execSync
              const result = execSync('aplay ./tmp/tmp-audio.wav')
            } else {
              fs.writeFileSync(
                './tmp/tmp-audio.mp3',
                await download(response.data[i].payload.src)
              )
              const execSync = require('child_process').execSync
              const result = execSync('mpg321 ./tmp/tmp-audio.mp3')
            }
            //const result = execSync(`curl ${response.data[i].payload.src} | mpg123 -`);
          }
        }
      }
      isEnding = response.data.filter(({ type }) => type === 'end')
      if (isEnding.length > 0) {
        clearNoReply()
        console.log('End of the convo')
        // LED.wakeword()
        const check = await Wakeword.detect()
        if (check == true) {
          // LED.listen()
          console.log('Wakeword detected!')
          VF.capture('launch')
        }
      } else {
        console.log('Continue')
        noReply = response.data.filter(({ type }) => type === 'no-reply')
        if (noReply.length > 0) {
          console.log(
            `Setting No-Reply for ${noReply[0].payload.timeout} seconds`
          )
          timeout = setTimeout(() => {
            interact(null, 'no-reply')
          }, noReply[0].payload.timeout * 1000)
        }
        VF.capture(null)
      }
    })
    .catch(function (error) {
      console.log(error)
    })
}
