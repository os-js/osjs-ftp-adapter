<p align="center">
  <img alt="OS.js Logo" src="https://raw.githubusercontent.com/os-js/gfx/master/logo-big.png" />
</p>

[OS.js](https://www.os-js.org/) is an [open-source](https://raw.githubusercontent.com/os-js/OS.js/master/LICENSE) desktop implementation for your browser with a fully-fledged window manager, Application APIs, GUI toolkits and filesystem abstraction.

[![Community](https://img.shields.io/badge/join-community-green.svg)](https://community.os-js.org/)
[![Donate](https://img.shields.io/badge/liberapay-donate-yellowgreen.svg)](https://liberapay.com/os-js/)
[![Donate](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=andersevenrud%40gmail%2ecom&lc=NO&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_SM%2egif%3aNonHosted)
[![Support](https://img.shields.io/badge/patreon-support-orange.svg)](https://www.patreon.com/user?u=2978551&ty=h&u=2978551)

# OS.js v3 FTP VFS Adapter

This is the FTP VFS (Server) Adapter for OS.js v3.

**THIS IS A WORK IN PROGRESS**

## Installation

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

Then create a mountpoint:

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
