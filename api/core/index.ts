import { APIGatewayEvent, Context } from 'aws-lambda';
import createAPI from 'lambda-api';

const api = createAPI();


var net = require('net')

var end = false
var rawResponse = ''

function parse_host_port(socket_lines){ //socket_lines: array of splited \r\n
  var host:string, port:string
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

api.any("/", async (req, res) => {
    res.header('Content-Type', 'application/octet-stream')
    //var in_data = Object.keys(req.body)[0]
    var in_data = req.body
    var host = req.headers['X-Ly-Host']
    var port = req.headers['X-Ly-Port']
  
    //previous connection established
    if(!host || !port){
      var socket_lines = in_data.split('\r\n')
      var first_line = socket_lines.shift()
      [host, port] = parse_host_port(socket_lines)
      if(first_line.substring(0, first_line.indexOf(' ')) === 'CONNECT'){
        //header
        res.header('X-Ly-Host', host)
        res.header('X-Ly-Port', port)
  
        res.send('HTTP/1.1 200 Connection Established\r\n\r\n')
        return
      }
    }
  
    //var host = 'example.com', port = 80
    var socket = net.connect(port, host, function() {
        //var request = "GET / HTTP/1.1\r\nHost: " + host + "\r\n\r\n"
        //var request = "GET example.com:80 HTTP/1.1\r\nHost: example.com:80\r\nUser-Agent: curl/7.88.1\r\nProxy-Connection: Keep-Alive\r\n\r\n"
        // send http request:
        socket.end(in_data)
  
        // assume utf-8 encoding:
        socket.setEncoding('binary')
  
        // collect raw http message:
        socket.on('data', function(chunk) {
            rawResponse += chunk
        })
        socket.on('end', function(){
            end=true
            console.log(rawResponse)
        })
    })
    while(!end)
      await new Promise(resolve => setTimeout(resolve, 2000))
  
    res.send(rawResponse)
});

export async function handler(event: APIGatewayEvent, context: Context) {
    return await api.run(event, context);
};
