const credentials = {
  ideo: {
    username: process.env.ESB_IDEO_USERNAME || '',
    password: process.env.ESB_IDEO_PASSWORD || '',
  },
  burjo: {
    username: process.env.ESB_BURJO_USERNAME || '',
    password: process.env.ESB_BURJO_PASSWORD || '',
  },
};

module.exports = credentials;
