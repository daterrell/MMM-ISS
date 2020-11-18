/* Magic Mirror
 * Node Helper: MMM-ISS
 *
 * By Dave Terrell
 * MIT Licensed.
 */

var NodeHelper = require('node_helper')
const Parser = require('rss-parser');
const Log = require("../../js/logger");

module.exports = NodeHelper.create({
  feedUrl: template`https://spotthestation.nasa.gov/sightings/xml_files/${0}_${1}_${2}.xml`,
  requestInFlight: false,
  
  getData: function () {
    if (this.requestInFlight) return;

    var country = (this.config.country).replace(/ /g,"_");
    var region = (this.config.region).replace(/ /g,"_");
    var city = (this.config.city).replace(/ /g,"_");
    var self = this;

    var parser = new Parser();
    this.requestInFlight = true;

    parser.parseURL(feedUrl(country, region, city))
      .then(feed => {
        var sightings = self.parseFeed(feed);
        self.sendSocketNotification('DATA_RESULT', sightings);
      })
      .catch(err => {
        self.sendSocketNotification('ERROR', err);
      })
      .finally(() =>  self.requestInFlight = false);
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === 'GET_DATA') {
        this.getData()
    }
  },

  parseFeed: function(feed) {
    let offset = new Date().getTimezoneOffset();
    let plusMinus = offset >= 0 ? '-' : '+';
    let stringOffset = "GMT" + plusMinus + ("0000" + (offset / 60 * 100)).substr(-4,4);
    let now = new Date();
    
    let sightings = 
      feed.items
        // Turn items' content from strings into JS object
        .map(item => {
          return item
            .content
            .split("<br/>")
            .filter(e => e.trim())
            .reduce((rv, el) => {
              let e = el.split(/:(.+)/); // Split string at first colon
              rv[e[0].trim().replace(" ", "_")] = e[1].trim();
              return rv;
            }, {});
        })
        // Remove Date and Time properties, replace with proper DateTime object
        .map(sighting => {
          let newDateTime = new Date([sighting.Date, sighting.Time, stringOffset].join(' '));
          delete sighting.Date;
          delete sighting.Time;
          sighting.DateTime = newDateTime;
          return sighting;
        })
        // Remove sightings that are in the past
        .filter(sighting => sighting.DateTime >= now)
        // Remove sightings that are too low in the sky 
        .filter(sighting => parseInt(sighting.Maximum_Elevation) >= 40)
        // Ensure we're listed by date
        .sort((a, b) => a.DateTime - b.DateTime);

    return sightings;
  }
});