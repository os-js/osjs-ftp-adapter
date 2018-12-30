/*!
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2018, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 */

/**
 * VFS Adapter Abstraction
 */
class FTPConnection {

  constructor(adapter, vfs) {
    this.adapter = adapter;
    this.vfs = vfs;
    this.connection = null; // TODO

  }

  destroy() {
    this.disconnect();
  }

  connect() {
    // TODO
    // this.vfs.mount.attributes.connection has the connection infromation from client / server
    return Promise.resolve();
  }

  disconnect() {
    // TODO
    return Promise.resolve();
  }

  exists(file) {
    return Promise.reject('Not implemented');
  }

  stat(file) {
    return Promise.reject('Not implemented');
  }

  readdir(file) {
    return Promise.reject('Not implemented');
  }

  readfile(file, options = {}) {
    return Promise.reject('Not implemented');
  }

  mkdir(file) {
    return Promise.reject('Not implemented');
  }

  writefile(file, data) {
    return Promise.reject('Not implemented');
  }

  rename(src, dest) {
    return Promise.reject('Not implemented');
  }

  copy(src, dest) {
    return Promise.reject('Not implemented');
  }

  unlink(file) {
    return Promise.reject('Not implemented');
  }

  search(root, pattern) {
    return Promise.reject('Not implemented');
  }

  touch(file) {
    return Promise.reject('Not implemented');
  }
}

/**
 * VFS Adapter Manager
 */
class FTPAdapter {
  constructor(core) {
    this.pool = [];
    this.core = core;
  }

  destroy() {
    this.pool = this.pool.filter(iter => {
      if (iter) {
        iter.destroy();
      }

      return false;
    });
  }

  createConnection(vfs) {
    // TODO
    return new FTPConnection(this, vfs);
    /*
    const c = new FTPConnection(this, vfs);

    this.pool.push(c);

    return c;
    */
  }

  removeConnection() {
    // TODO
    const foundIndex = this.pool.findIndex(iter => false);
    if (foundIndex !== -1) {
      if (this.pool[foundIndex]) {
        this.pool[foundIndex].destroy();
      }

      this.pool.splice(foundIndex, 1);
    }
  }

  getConnection(vfs) {
    // TODO
    return this.createConnection(vfs);
  }
}

/*
 * VFS Adapter Proxy
 */
const adapter = core => {
  const a = new FTPAdapter(core);

  // This will forward all calls to a FTPConnection
  const proxy = new Proxy({}, {
    get: (obj, prop) => {
      return vfs => (...args) => a.getConnection(vfs)[prop](...args);
    }
  });

  core.on('osjs/core:destroy', () => a.destroy());

  return proxy;
};

module.exports = adapter;
