const YAML = require('yaml');
const {promisify} = require('util');
const fs = require('fs');
const path = require('path');
const got = require('got');
const stream = require('stream');
const {default: PQueue} = require('p-queue');

const pipeline = promisify(stream.pipeline);
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

const download = (from, to) => async () => {
  if (await exists(from)) {
    console.log(`Skipping ${from} because ${to} already exists.`);
    return;
  }

  console.log(`Download ${from} to ${to}`);
  await pipeline(
    got.stream(from),
    fs.createWriteStream(to)
  );
};

const queue = new PQueue({concurrency: 4});

(async() => {
  for (const [id, date, title, caption, large, small, flickrUrl, photoId, createdAt, updatedAt] of images.values) {
    const ext = path.extname(large);  
    const localFile = path.resolve(`./${date}-${id}${ext}`);
    queue.add(download(large, localFile));
  }
})();

