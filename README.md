<p align="center">
  <img alt="OS.js Logo" src="https://raw.githubusercontent.com/os-js/gfx/master/logo-big.png" />
</p>

[OS.js](https://www.os-js.org/) is an [open-source](https://raw.githubusercontent.com/os-js/OS.js/master/LICENSE) desktop implementation for your browser with a fully-fledged window manager, Application APIs, GUI toolkits and filesystem abstraction.

[![Support](https://img.shields.io/badge/patreon-support-orange.svg)](https://www.patreon.com/user?u=2978551&ty=h&u=2978551)
[![Back](https://opencollective.com/osjs/tiers/backer/badge.svg?label=backer&color=brightgreen)](https://opencollective.com/osjs)
[![Sponsor](https://opencollective.com/osjs/tiers/sponsor/badge.svg?label=sponsor&color=brightgreen)](https://opencollective.com/osjs)
[![Donate](https://img.shields.io/badge/liberapay-donate-yellowgreen.svg)](https://liberapay.com/os-js/)
[![Donate](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://paypal.me/andersevenrud)
[![Community](https://img.shields.io/badge/join-community-green.svg)](https://community.os-js.org/)

# OS.js v3 FTP VFS Adapter

This is the FTP VFS (Server) Adapter for OS.js v3.

**This is a work in progress**

## Installation

```
npm install @osjs/ftp-adapter
```

## Usage

In your `src/server/index.js` bootstrap file:

```
const ftpAdapter = require('@osjs/ftp-adapter');

osjs.register(VFSServiceProvider, {
  args: {
    adapters: {
      ftp: ftpAdapter
    }
  }
});
```

Then create a mountpoint in your configuration files:

```
// src/server/config.js
{
  vfs: {
    mountpoints: [{
      name: 'myftp',
      adapter: 'ftp',
      attributes: {
        connection: {
          host: 'localhost',
          user: 'osjs',
          password: 'osjs',
          secure: false
        }
      }
     }]
   }
}

// src/client/config.js
{
  vfs: {
    mountpoints: [{
      name: 'myftp',
      label: 'My FTP Drive'
     }]
   }
}
```

*At some point users can create their own server mounts via the client*.
