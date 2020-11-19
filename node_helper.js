/* Magic Mirror
 * Node Helper: MMM-ISS
 *
 * By Dave Terrell
 * MIT Licensed.
 */

let NodeHelper = require('node_helper')
const Parser = require('rss-parser');
const Log = require("../../js/logger");

module.exports = NodeHelper.create({
  feedUrl: template`https://spotthestation.nasa.gov/sightings/xml_files/${0}_${1}_${2}.xml`,
  requestInFlight: false,

  getData: function () {
    if (this.requestInFlight) return;

    let country = (this.config.country).replace(/ /g, "_");
    let region = (this.config.region).replace(/ /g, "_");
    let city = (this.config.city).replace(/ /g, "_");
    let self = this;

    let parser = new Parser();
    this.requestInFlight = true;

    parser.parseURL(feedUrl(country, region, city))
      .then(feed => {
        let sightings = self.parseFeed(feed);
        self.sendSocketNotification('DATA_RESULT', sightings);
      })
      .catch(err => {
        self.sendSocketNotification('ERROR', err);
      })
      .finally(() => self.requestInFlight = false);
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === 'GET_DATA') {
      this.getData()
    }
  },

  parseFeed: function (feed) {
    let offset = new Date().getTimezoneOffset();
    let plusMinus = offset >= 0 ? '-' : '+';
    let stringOffset = "GMT" + plusMinus + ("0000" + (offset / 60 * 100)).substr(-4, 4);
    let now = new Date();

    let sightings =
      feed.items
        .map(item => {
          /**
           * A sample item content:
           * Date: Thursday Nov 19, 2020 <br/> Time: 7:12 PM <br/> Duration: less than 1 minute <br/> Maximum Elevation: 10° <br/> Approach: 10° above WNW <br/> Departure: 10° above WNW <br/> 
           */
          return item
            .content
            .split("<br/>")
            .filter(e => e.trim())
            .reduce((rv, el) => {
              let e = el.split(/:(.+)/); // Split string at first colon

              let prop = e[0].trim();
              prop = prop.replace(" ", "_");

              let data = e[1].trim();
              data = data
                .replace("less than ", "<")
                .replace(" above ", "")
                .replace("minute", "min");

              rv[e[prop]] = data;

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
        // Move directions (ex. WNW) out of Approach and Departure properties
        .map(sighting => {
          let splitParts = function (item) {
            let parts = item.split("°");

            return {
              degree: parts[0],
              direction: parts[1]
            };
          };

          let app = splitParts(sightings.Approach);
          sighting.Approach = app.degree;
          sighting.Approach_Direction = app.direction;

          let dep = splitParts(sighting.Departure);
          sighting.Departure = dep.degree;
          sighting.Departure_Direction = dep.direction;

          return sighting;
        })
        // Remove sightings that are in the past
        .filter(sighting => sighting.DateTime >= now)
        // Remove sightings that are too low in the sky 
        .filter(sighting => parseInt(sighting.Maximum_Elevation) >= this.config.minElevation)
        // Ensure we're listed by date
        .sort((a, b) => a.DateTime - b.DateTime)[0];

    return {
      date: sightings.DateTime.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }),
      time: sightings.DateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      visible: sighting.Duration,
      maxHeight: sightings.Maximum_Elevation,
      appears: sightings.Approach,
      appearsDirection: sightings.Approach_Direction,
      disappears: sightings.Departure,
      disappearsDirection: sightings.Departure_Direction,
    };
  }
});
