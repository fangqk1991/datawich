const path = require('path')
const fs = require('fs')

let [, , rootDir] = process.argv
rootDir = rootDir || path.resolve(`${__dirname}/../../`)

{
  const filePath = `${rootDir}/package.json`
  const content = fs.readFileSync(filePath, 'utf8')
  const data = JSON.parse(content)
  const pureData = {
    name: data['name'],
    version: data['version'],
    dependencies: data['dependencies'] || {},
    devDependencies: data['devDependencies'] || {},
    workspaces: data['workspaces'] || [],
    private: true,
  }
  fs.writeFileSync(filePath, JSON.stringify(pureData, null, 2))
}

{
  const subPackagePaths = ['libraries', 'services', 'kits', 'packages'].reduce((result, folder) => {
    folder = `${rootDir}/${folder}`
    if (!fs.existsSync(folder)) {
      return result
    }
    const items = fs
      .readdirSync(folder)
      .filter(
        (item) => fs.lstatSync(`${folder}/${item}`).isDirectory() && fs.existsSync(`${folder}/${item}/package.json`)
      )
    return result.concat(items.map((item) => `${folder}/${item}/package.json`))
  }, [])
  for (const filePath of subPackagePaths) {
    const content = fs.readFileSync(filePath, 'utf8')
    const data = JSON.parse(content)
    const pureData = {
      name: data['name'],
      version: data['version'],
      dependencies: data['dependencies'] || {},
      devDependencies: data['devDependencies'] || {},
      private: true,
    }
    fs.writeFileSync(filePath, JSON.stringify(pureData, null, 2))
  }
}
