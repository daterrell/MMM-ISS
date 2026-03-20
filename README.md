# MMM-ISS

A [MagicMirror²](https://github.com/MichMich/MagicMirror) module that displays the next visible pass of the International Space Station (ISS) overhead.

> **Note:** This module previously used NASA's SpotTheStation service, which was shut down on June 12, 2025. It now uses the [N2YO API](https://www.n2yo.com/api/) instead. A free API key is required.

## Screenshot

![MMM-ISS Screenshot](screenshot.png)

## Installation

```bash
cd ~/MagicMirror/modules
git clone https://github.com/daterrell/MMM-ISS
cd MMM-ISS
npm install
```

## N2YO API Key

1. Register for a free account at [n2yo.com](https://www.n2yo.com/login/register/)
2. Your API key will be shown on your [account page](https://www.n2yo.com/login/)
3. The free tier allows up to 1,000 requests per hour, which is more than enough for this module

## Configuration

Add the following to your `config.js`:

```javascript
{
  module: "MMM-ISS",
  position: "bottom_right",
  config: {
    apiKey: "YOUR_N2YO_API_KEY",  // Required – get yours at n2yo.com
    lat: 37.77,                    // Your latitude
    lng: -122.41,                  // Your longitude
    alt: 0,                        // Your altitude in meters (optional, default: 0)
    days: 10,                      // How many days ahead to search (optional, default: 10)
    minElevation: 40               // Minimum elevation in degrees (optional, default: 40)
  }
},
```

### Configuration Options

| Option | Description | Default |
|---|---|---|
| `apiKey` | **Required.** Your N2YO API key | — |
| `lat` | Your latitude | `0` |
| `lng` | Your longitude | `0` |
| `alt` | Your altitude in meters | `0` |
| `days` | Number of days ahead to search for passes | `10` |
| `minElevation` | Minimum pass elevation in degrees (0–90). Higher values show only more visible passes | `40` |

## License

MIT — By Dave Terrell
