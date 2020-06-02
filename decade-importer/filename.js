const path = require('path');

const filename = (date, large, id, suffix = '') => {
  const ext = path.extname(large);
  return `${date}-${id}${suffix}${ext}`;
};

exports.filename = filename;
