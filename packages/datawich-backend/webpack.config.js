const { BackpackBuilder } = require('@fangcha/webpack')
const glob = require('glob')

const entry = {
  ...glob.sync('./src/apps/*.ts').reduce((acc, file) => {
    acc[file.match('^\\.\\/src\\/apps\\/(.+)\\.ts$')[1]] = file
    return acc
  }, {}),
  ...glob.sync('./src/scripts/*.ts').reduce((acc, file) => {
    acc[file.match('^\\.\\/src\\/(scripts\\/.+)\\.ts$')[1]] = file
    return acc
  }, {}),
}

const builder = new BackpackBuilder()
builder.entry = entry

module.exports = builder.build()
