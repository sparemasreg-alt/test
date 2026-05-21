const http = require('http');
http.get('http://localhost:3000/src/data/playersData.ts', (res) => {
  console.log(res.statusCode);
});
