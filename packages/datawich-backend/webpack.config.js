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

const localPackageNames = glob.sync('../../libraries/*/package.json').map((item) => require(item).name)
const builder = new BackpackBuilder()
builder.entry = entry
builder.nodeExternalsAllowList = [/^@web/, ...localPackageNames]
module.exports = builder.build()
