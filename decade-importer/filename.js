const path = require('path');

const filename = (date, large, id) => {
  const ext = path.extname(large);
  return `${date}-${id}${ext}`;
};

exports.filename = filename;
