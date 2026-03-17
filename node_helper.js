/* Magic Mirror
 * Node Helper: MMM-ISS
 *
 * By Dave Terrell
 * MIT Licensed.
 *
 * Modified to use N2YO API instead of NASA SpotTheStation
 * (SpotTheStation was shut down on June 12, 2025)
 *
 * Requires a free N2YO API key from https://www.n2yo.com/api/
 * Add `apiKey: 'YOUR_KEY'` to your module config in config.js
 */

let NodeHelper = require('node_helper');
const https = require('https');

// ISS NORAD satellite ID
const ISS_ID = 25544;

// Compass directions lookup
const DIRECTIONS = [
  'N', 'NNE', 'NE', 'ENE',
  'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW',
  'W', 'WNW', 'NW', 'NNW'
];

function degreesToCompass(deg) {
  return DIRECTIONS[Math.round(deg / 22.5) % 16];
}

module.exports = NodeHelper.create({

  requestInFlight: false,

  getData: function (config) {
    if (this.requestInFlight) return;
    this.requestInFlight = true;

    if (!config.apiKey) {
      console.error('MMM-ISS: No N2YO API key set. Add `apiKey: "YOUR_KEY"` to your config.');
      this.sendSocketNotification('ERROR', 'No API key');
      this.requestInFlight = false;
      return;
    }

    let lat = config.lat || 52.36;
    let lng = config.lng || 5.19;
    let alt = config.alt || 0;
    let days = config.days || 10;
    let minElevation = parseInt(config.minElevation) || 40;

    // N2YO visual passes endpoint
    let url = `https://api.n2yo.com/rest/v1/satellite/visualpasses/${ISS_ID}/${lat}/${lng}/${alt}/${days}/${minElevation}/&apiKey=${config.apiKey}`;

    let self = this;
    https.get(url, (res) => {
      let data = '';

      res.on('data', chunk => data += chunk);

      res.on('end', () => {
        try {
          let json = JSON.parse(data);

          if (!json.passes || json.passes.length === 0) {
            console.log('MMM-ISS: No passes found.');
            self.sendSocketNotification('DATA_RESULT', {});
          } else {
            let result = self.parsePass(json.passes[0]);
            self.sendSocketNotification('DATA_RESULT', result);
          }
        } catch (e) {
          console.error('MMM-ISS: Error parsing N2YO response:', e);
          self.sendSocketNotification('ERROR', e.message);
        }

        self.requestInFlight = false;
      });
    }).on('error', (err) => {
      console.error('MMM-ISS: HTTP error:', err);
      self.sendSocketNotification('ERROR', err.message);
      self.requestInFlight = false;
    });
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === 'GET_DATA') {
      this.getData(payload);
    }
  },

  parsePass: function (pass) {
    // N2YO returns Unix timestamps (UTC)
    let startTime = new Date(pass.startUTC * 1000);
    let duration = Math.round(pass.duration / 60); // seconds → minutes

    let durationStr = duration < 1 ? '<1 min' : duration + ' min';

    return {
      date: startTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
      time: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      visible: durationStr,
      maxHeight: pass.maxEl + '°',
      appears: pass.startEl + '°',
      appearsDirection: degreesToCompass(pass.startAz),
      disappears: pass.endEl + '°',
      disappearsDirection: degreesToCompass(pass.endAz),
    };
  }
});
