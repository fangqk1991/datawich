import * as http from 'http'
import { DatawichConfig } from '../DatawichConfig'

for (const port of [DatawichConfig.adminPort, DatawichConfig.openPort]) {
  http
    .createServer((_request, response) => {
      response.writeHead(200, { 'Content-Type': 'text/plain' })
      response.end('PONG\n')
    })
    .listen(port)
}
