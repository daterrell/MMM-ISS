/* Magic Mirror
 * Module: MMM-ISS
 *
 * By Dave Terrell
 * MIT Licensed.
 */

Module.register("MMM-ISS", {
  sightings: null,
  error: false,
  count: 1,

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
    return "MMM-ISS.njk"
  },

  getTemplateData: function () {
    return this.sightings;
  },

  start: function () {
    console.log("Starting up " + this.name);
    this.getInfo();

    var self = this;
    setInterval(function () {
      self.getInfo();
    }, 300000);
  },

  getInfo: function () {
    console.log(this.name + "[MAIN MODULE]: getInfo()");
    this.sendSocketNotification("GET_DATA", this.config);
  },

  socketNotificationReceived: function (notification, payload) {
    if (!payload || 
        notification === "ERROR" ||
        Object.keys(payload).length <= 0) {
      this.sightings = null;
      this.hide();
    } else if (notification === "DATA_RESULT") {
      this.show();
      this.sightings = payload;
      this.updateDom(this.config.fadeSpeed);
    }
  }
});
