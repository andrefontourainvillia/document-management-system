const fs = require('node:fs');
const fsPromises = require('node:fs/promises');
const path = require('node:path');

class LocalFileRepository {
  constructor(storageDirectory) {
    this.storageDirectory = path.resolve(storageDirectory);
    fs.mkdirSync(this.storageDirectory, { recursive: true });
  }

  save(uploadedFile) {
    return { ...uploadedFile };
  }

  getPath(storedName) {
    const filePath = path.resolve(this.storageDirectory, storedName);
    if (path.dirname(filePath) !== this.storageDirectory || path.basename(storedName) !== storedName) {
      throw new Error('Invalid stored file name');
    }
    return filePath;
  }

  async exists(storedName) {
    try {
      await fsPromises.access(this.getPath(storedName), fs.constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  async remove(storedName) {
    await fsPromises.rm(this.getPath(storedName), { force: true });
  }
}

module.exports = { LocalFileRepository };