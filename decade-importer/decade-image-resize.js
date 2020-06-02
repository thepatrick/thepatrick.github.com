const {promisify} = require('util');
const fs = require('fs');
const path = require('path');
const {default: PQueue} = require('p-queue');
const sharp = require('sharp');
const { filename } = require("./filename");

const stat = promisify(fs.stat);
const exists = async (file) => {
  try {
    await stat(file);
    return true;
  } catch (err) {
    return false;
  }
}

const images = require('./decade.json');

const makeThumbnail = (from, to, w, h) => async () => {
  if (await exists(to)) {
    console.log(`Skipping ${to} because it already exists.`);
    return;
  }

  if (!await exists(from)) {
    console.log(`Skipping ${from} because it does not exist.`);
    return;
  }

  console.log(`Resizing ${from} to ${to}`);

  await sharp(from)
    .resize(w, h)
    .toFile(to);
};

const queue = new PQueue({concurrency: 4});

(async() => {
  for (const [id, date, title, caption, large, small, flickrUrl, photoId, createdAt, updatedAt] of images.values) {
    const localFile = path.resolve(`./large/${filename(date, large, id)}`);
    const smallFile = path.resolve(`./small/${filename(date, large, id)}`);
    const smallFileRetina = path.resolve(`./small/${filename(date, large, id, '@2x')}`);
    queue.add(makeThumbnail(localFile, smallFile));
    queue.add(makeThumbnail(localFile, smallFileRetina));
  }
})();

