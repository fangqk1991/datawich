module.exports = {
  Datawich: {
    mysql: {
      datawichDB: {
        host: 'host.docker.internal',
      },
    },
    datawichResque: {
      redisHost: 'host.docker.internal',
    },
  },
}
