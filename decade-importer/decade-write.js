const YAML = require('yaml');
const images = require('./decade.json');
const fs = require('fs');
const path = require('path');
const { filename } = require("./filename");

const fileForImage = (
  id, date, title, caption, large, small, flickrUrl, photoId, createdAt, updatedAt
) => `---
${YAML.stringify({
  title,
  date,
  large: `https://mea.patrick.nz/decade/large/${filename(date, large, id)}`,
  small: `https://mea.patrick.nz/decade/small/${filename(date, large, id)}`,
  smallRetina: `https://mea.patrick.nz/decade/small/${filename(date, large, id, '@2x')}`,
  flickrUrl,
  photoId,
  createdAt,
  updatedAt,
})}
---
${caption}
`;

for (const [id, date, title, caption, large, small, flickrUrl, photoId, createdAt, updatedAt] of images.values) {
  const contents = fileForImage(id, date, title, caption, large, small, flickrUrl, photoId, createdAt, updatedAt);

  const filename = path.resolve(`./${date}.md`);

  fs.writeFileSync(filename, contents);
  console.log(`Wrote: ${filename}`);

}