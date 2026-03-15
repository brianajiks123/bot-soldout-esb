const credentials = {
  ideo: {
    username: process.env.IDEO_USERNAME || '',
    password: process.env.IDEO_PASSWORD || '',
  },
  burjo: {
    username: process.env.BURJO_USERNAME || '',
    password: process.env.BURJO_PASSWORD || '',
  },
};

module.exports = credentials;
