import { APIGatewayEvent, Context } from 'aws-lambda';
import createAPI from 'lambda-api';

const api = createAPI();


var net = require('net')

var end = false
var rawResponse = ''

function parse_host_port(socket_lines){ //socket_lines: array of splited \r\n
  var host, port
  for(const line of socket_lines){
    if(!line)
      break
    const header_name = line.substr(0, line.indexOf(': '))
    const header_value = line.substr(line.indexOf(': ')+2)
    if(header_name === "Host"){
      const split_pos = header_value.indexOf(':')
      if(split_pos !== -1){
        host = header_value.substr(0, split_pos)
        port = header_value.substr(split_pos+1)
      }else{  //implicit port
        host = header_value
        port = '80'
      }
      break
    }
  }
  return [host, port]
}

api.METHOD(['post','get', 'connect'], async (req, res) => {
    res.send(req.rawBody)
    return
    res.header('Content-Type', 'application/octet-stream')
    res.send("test data")
});

export async function handler(event: APIGatewayEvent, context: Context) {
    return await api.run(event, context);
};
