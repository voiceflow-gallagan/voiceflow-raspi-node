// LIB | PACKAGE
fs = require('fs')
express = require('express')
require('dotenv').config()
localtunnel = require('localtunnel')
tunnel = null

// Create HTTP server.
app = express()
server = app.listen(process.env.PORT || 3978, async function () {
  const { port } = server.address()
  console.log(
    '\nServer listening on port %d in %s mode',
    port,
    app.settings.env
  )
  // Setup the tunnel for testing
  if (app.settings.env == 'development') {
    tunnel = await localtunnel({
      port: port,
      subdomain: process.env.TUNNEL_SUBDOMAIN,
    })
    console.log(`\nEndpoint: ${tunnel.url}/api/messages?event=hello`)
    console.log(`\n`)
    tunnel.on('close', () => {
      // tunnels are closed
      console.log('\n\nClosing tunnel')
    })
  }
})

VF = require('./components/dmapi.js')
// LED = require('./components/led.js')
Audio = require('./components/audio.js')
Launch = require('./components/launch.js')
getmac = require('getmac')
Wakeword = require('./components/wakeword.js')

isInterrupted = false
apiKey = process.env.VF_API_KEY
versionID = process.env.VF_VERSION_ID
mac = getmac.default().replace(/:/g, '').toUpperCase()
;(async function () {
  try {
    // LED.wakeword()
    const check = await Wakeword.detect()
    if (check == true) {
      console.log('Wakeword detected!')
      VF.capture('launch')
    }
  } catch (e) {
    console.error(e.toString())
  }
})()

// interrupt
process.on('SIGINT', function () {
  isInterrupted = true
  process.exit()
})

process.on('exit', () => {
  if (process.env.NODE_ENV == 'development') {
    tunnel.close()
  }
  return console.log(`Bye!\n\n`)
})
