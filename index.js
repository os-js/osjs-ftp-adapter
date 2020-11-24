/*!
 * OS.js - JavaScript Cloud/Web Desktop Platform
 *
 * Copyright (c) 2011-2020, Anders Evenrud <andersevenrud@gmail.com>
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
const path = require('path');
const mime = require('mime');
const FTP = require('promise-ftp');

const getPath = dir => dir.split(':').splice(1).join('');
const getConnectionId = conn => `${conn.user}@${conn.host}:${conn.secure}`;

/**
 * VFS Adapter Abstraction
 */
class FTPConnection {

  constructor(adapter, options) {
    this.adapter = adapter;
    this.id = getConnectionId(options);
    this.options = Object.assign({
      host: '',
      user: '',
      password: '',
      secure: false
    }, options);

    this.connection = new FTP({
      timeout: 0
    });
  }

  destroy() {
    this.disconnect();
  }

  clone() {
    return new FTPConnection(this.adapter, this.options);
  }

  connect() {
    // FIXME: Does the connected attribute change when connection is dropped ?
    return this.connection.rawClient.connected
      ? Promise.resolve(this.connection)
      : this.connection.connect(this.options);
  }

  disconnect() {
    return this.connection.end();
  }

  exists(file) {
    return this.stat(file)
      .then(stat => !!stat);
  }

  stat(file) {
    const ppath = getPath(file);
    const filename = path.basename(ppath);

    return this.readdir(path.dirname(file))
      .then(list => list.find(iter => iter.filename === filename));
  }

  readdir(file) {
    // FIXME: Symlinks
    return this.connection.list(getPath(file))
      .then(list => {
        return list.map(iter => {
          const isFile = iter.type !== 'd';

          return {
            isFile,
            isDirectory: !isFile,
            mime: isFile ? mime.getType(iter.name) : null,
            size: iter.size,
            path: `${file.replace(/\/$/, '')}/${iter.name}`,
            filename: iter.name,
            stat: {/* TODO */}
          };
        });
      });
  }

  readfile(file, options = {}) {
    return this.connection.get(getPath(file));
  }

  mkdir(file) {
    return this.connection.mkdir(getPath(file));
  }

  writefile(file, data) {
    return this.connection.put(data, getPath(file));
  }

  rename(src, dest) {
    return this.connection.rename(getPath(src), getPath(dest));
  }

  copy(src, dest) {
    return this.readfile(src)
      .then(data => {
        const newConnection = this.clone();
        const wrap = r => {
          newConnection.destroy();
          return r;
        };

        return newConnection.connect()
          .then(() => newConnection.writefile(dest, data))
          .then(wrap)
          .catch(wrap);
      })
      .then(() => true);
  }

  unlink(file) {
    return this.stat(file)
      .then(found => {
        if (!found) {
          return Promise.reject(new Error('File not found'));
        }

        if (found && found.isDirectory) {
          return this.connection.rmdir(getPath(file), true);
        }

        return this.connection.delete(getPath(file));
      });
  }

  search(root, pattern) {
    return Promise.reject('Not supported');
  }

  touch(file) {
    return this.writefile(file, '')
      .then(() => true);
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

  createConnection(options) {
    // TODO: Listen for event to remove automatically
    const c = new FTPConnection(this, options);

    this.pool.push(c);

    return c;
  }

  removeConnection(id) {
    const foundIndex = this.pool.findIndex(iter => iter.id === id);
    if (foundIndex !== -1) {
      if (this.pool[foundIndex]) {
        this.pool[foundIndex].destroy();
      }

      this.pool.splice(foundIndex, 1);

      return true;
    }

    return false;
  }

  getConnection(vfs) {
    const options = vfs.mount.attributes.connection;
    const id = getConnectionId(options);
    const found = this.pool.find(iter => iter.id === id);
    const connection = found ? found : this.createConnection(options);

    return connection.connect()
      .then(() => connection);
  }
}

/*
 * VFS Adapter Proxy
 */
const adapter = core => {
  const a = new FTPAdapter(core);

  const wrap = name => vfs => (...args) => {
    const conn = new FTPConnection(a, vfs.mount.attributes.connection);
    return conn
      .connect()
      .then(() => conn[name](...args))
      .finally(() => a.destroy());
  };

  const proxy = {
    exists: wrap('exists'),
    stat: wrap('stat'),
    readdir: wrap('readdir'),
    readfile: wrap('readfile'),
    mkdir: wrap('mkdir'),
    writefile: wrap('writefile'),
    rename: wrap('rename'),
    copy: wrap('copy'),
    unlink: wrap('unlink'),
    search: wrap('search'),
    touch: wrap('touch')
  };

  core.on('osjs/core:destroy', () => a.destroy());

  return proxy;
};

module.exports = adapter;
