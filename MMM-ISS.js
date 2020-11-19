/* Magic Mirror
 * Module: MMM-ISS
 *
 * By Dave Terrell
 * MIT Licensed.
 */

Module.register("MMM-ISS", {
  sightings: null,
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
    return ["MMM-ISS.css"];
  },

  getTemplate: function () {
    if (this.sightings)
      return "MMM-ISS.njk"
  },

  getTemplateData: function () {
    if (this.sightings)
      return this.sightings;
  },

  start: function () {
    console.log("Starting up " + this.name);
    this.getInfo();

    var self = this;
    setInterval(function () {
      self.getInfo();
    }, 10000);
  },

  getInfo: function () {
    console.log(this.name + "[MAIN MODULE]: getInfo()");
    this.sendSocketNotification("GET_DATA", this.config);
  },

  socketNotificationReceived: function (notification, payload) {
    if (!payload || notification === "ERROR") {
      this.sightings = null;
      this.hide();
    } else if (notification === "DATA_RESULT") {
      this.sightings = payload;
      this.updateDom(this.config.fadeSpeed);
    }
  }
});
