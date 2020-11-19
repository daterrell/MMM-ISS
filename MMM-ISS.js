/* Magic Mirror
 * Module: MMM-ISS
 *
 * By Dave Terrell
 * MIT Licensed.
 */

Module.register("MMM-ISS", {
  sightings: {},
  error: false,

  defaults: {
    /**
     * The country, region and city must come from supported listings on spotthestation.nasa.gov
     */
    minElevation: '40',
    country: 'United States',
    region: 'California',
    city: 'Irvine'
  },

  getStyles: function () {
    return ["MMM-ISS.css", "bootstrap.min.css"];
  },

  getTemplate: function () {
    return "MMM-ISS.njk"
  },

  getTemplateData: function () {
    return this.sightings;
  },

  /**
   * A sample item content:
   * Date: Thursday Nov 19, 2020 <br/> Time: 7:12 PM <br/> Duration: less than 1 minute <br/> Maximum Elevation: 10° <br/> Approach: 10° above WNW <br/> Departure: 10° above WNW <br/> 
   */

  getHeader: function () {
    return false;
  },

  start: function () {
    console.log("Starting up " + this.name);
    this.getInfo();

    var self = this;
    setInterval(function () {
      self.getInfo();
    }, 3600000);
  },

  getInfo: function () {
    console.log(this.name + "[MAIN MODULE]: getInfo()");
    this.sendSocketNotification("GET_DATA", this.config);
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "DATA_RESULT") {
      this.sightings = payload;
      this.updateDom(this.config.fadeSpeed);
    }
  }
});
