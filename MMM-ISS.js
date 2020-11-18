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
    city: 'Irvine',
    header: 'ISS Sightings',
    useHeader: false
  },

  getHeader: function () {
    return this.config.useHeader && this.config.header;
  },

  // Define required scripts.
  getScripts: function () {
  },

  // set update interval
  start: function () {
    console.log("Starting up " + this.name);
    this.updateDom();
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "ERROR") {
      this.error = true;
    }
    else if (notification !== "DATA_RESULT") {
      return;
    } else {
      this.error = false;
    }

    this.sightings = payload;
    this.updateDom(this.config.fadeSpeed);
  },

  // Update function
  getDom: function () {
    var wrapper = document.createElement("div");

    var textWrapper = document.createElement("div");
    textWrapper.className = "date normal medium";
    textWrapper.innerHTML = this.config.event;
    wrapper.appendChild(textWrapper);

    var timeWrapper = document.createElement("div");
    timeWrapper.className = "time bright xlarge light";
    timeWrapper.style = "text-align: center;";

    var target = moment(this.config.date).add(1, "day");
    var now = moment();
    var timeDiff = target.diff(now);

    // Set days, hours, minutes and seconds
    var diffDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    var diffHours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var diffMinutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    var diffSeconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    labelWrapper = function (text) {
      var wrapper = document.createElement("sup");
      wrapper.className = "dimmed";
      wrapper.innerHTML = text;
      return wrapper;
    }

    // Build the output
    var days = document.createElement("div");
    var hrs = document.createElement("div");
    var tMinus = document.createElement("div");

    if (diffDays <= -1) {
      this.hide();
      return wrapper;
    }

    if (diffDays < 0 && diffHours < 24) {
      days.innerHTML = "TODAY!";
      timeWrapper.appendChild(days);
    } else {
      if (diffDays > 1) {
        days.innerHTML = diffDays;
        days.appendChild(labelWrapper(this.config.daysLabel));
      } else {
        tMinus.innerHTML += `T-${this.pad(diffHours, 2)}:${this.pad(diffMinutes, 2)}:${this.pad(diffSeconds, 2)}`;
      }
    }

    timeWrapper.appendChild(days);
    timeWrapper.appendChild(hrs);
    timeWrapper.appendChild(tMinus);

    wrapper.appendChild(timeWrapper);

    return wrapper;
  },

  pad: function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
  }
});