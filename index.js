var http = require("http");
const PORT=process.env.PORT || 3001;
let Requests = 5;
let time = 60000;

let ipData = [];

//ARL API Rate Limiter Problem
const ARL = (ip) => {
  let newDate = new Date();
  let check = true;

  let ok;

  ok = ipData.map((data, index) => {
    
    if (
      data.ip === ip &&
      newDate - data.date <= time &&
      data.totelRequest < Requests
    ) {
      ipData[index].totelRequest = ipData[index].totelRequest + 1;

      check = false;

      return true;
    } else if (newDate - data.date > time) {
      ipData[index].totelRequest = 1;
      ipData[index].date = new Date();
      check = false;
      return true;
    } else if (
      data.ip === ip &&
      newDate - data.date <= time &&
      data.totelRequest >= Requests
    ) {
      check = false;
      return false;
    }
  });

  if (check) {
    newDate = new Date();

    let newData = { ip, date: newDate, totelRequest: 1 };
    ipData = [...ipData, newData];

    return true;
  } else {
    return ok[0];
  }
};

http.createServer(function (req, res) {
    // console.log( req.socket.localAddress + "from local address");

    const myPromise = new Promise((resolve, reject) => {
      let ip = null;

      const parseIp = (req) =>
        req.headers["x-forwarded-for"]?.split(",").shift() ||
        req.socket?.remoteAddress;

      ip = parseIp(req);

      ARLcheck = ARL(ip);

      if (ARLcheck && ip) {
        resolve(ip);
      } else {
        reject(ip);
      }
    })
      .then((ip) => {
        res.writeHead(200, { "Content-Type": "text/html" }); // http header
        var url = req.url;
        if (url === "/" && ip) {
          res.write("<h1>Hi, i am Data<h1>"); //write a response
          res.end(); //end the response
        } else if (!ip) {
          res.write("<h1>IP address not found<h1>"); //write a response
          res.end(); //end the response
        }
      })
      .catch((err) => {
        console.log(err);
        var url = req.url;
        if (url === "/") {
          res.write("<h1>You can make only 5 Request per min<h1>"); //write a response
          res.end(); //end the response
        }
      });
  })
  .listen(PORT, function () {
    console.log(`server start at port ${PORT}`); //the server object listens on port 3000
  });
