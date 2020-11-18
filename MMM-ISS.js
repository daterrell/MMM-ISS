const Parser = require('rss-parser');
let parser = new Parser();

(async() => {
  let feed = await parser.parseURL('https://spotthestation.nasa.gov/sightings/xml_files/United_States_California_Irvine.xml');

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
      .filter(sighting => parseInt(sighting.Maximum_Elevation) >= 40);

      let i = 0;
})();