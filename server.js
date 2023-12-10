var fs = require("fs");
var path = require("path");

// Listen on a specific host via the HOST environment variable
var host = process.env.HOST || "0.0.0.0";
// Listen on a specific port via the PORT environment variable
var port = process.env.PORT || 8080;
var port_https = process.env.PORT_https || 8080; // for https

// Grab the blacklist from the command-line so that we can update the blacklist without deploying
// again. CORS Anywhere is open by design, and this blacklist is not used, except for countering
// immediate abuse (e.g. denial of service). If you want to block all origins except for some,
// use originWhitelist instead.
var originBlacklist = parseEnvList(process.env.CORSANYWHERE_BLACKLIST);
var originWhitelist = parseEnvList(process.env.CORSANYWHERE_WHITELIST);
function parseEnvList(env) {
  if (!env) {
    return [];
  }
  return env.split(",");
}

// Set up rate-limiting to avoid abuse of the public CORS Anywhere server.
var checkRateLimit = require("./lib/rate-limit")(
  process.env.CORSANYWHERE_RATELIMIT
);

var cors_proxy = require("./lib/cors-anywhere");
cors_proxy
  .createServer({
    originBlacklist: originBlacklist,
    //originWhitelist: originWhitelist,
    originWhitelist: [], // Allow all origins
    //requireHeader: ["origin", "x-requested-with"],
    checkRateLimit: checkRateLimit,
    removeHeaders: [
      "cookie",
      "cookie2",
      // Strip Heroku-specific headers
      "x-request-start",
      "x-request-id",
      "via",
      "connect-time",
      "total-route-time",
      "x-invoke-output",
      "x-forwarded-for",
      "x-forwarded-proto",
      "x-forwarded-port",
      "x-forwarded-host",
      "x-invoke-query",
      "x-invoke-path",
      "x-middleware-invoke",
      // Other Heroku added debug headers
      // 'x-forwarded-for',
      // 'x-forwarded-proto',
      // 'x-forwarded-port',
    ],
    //setHeaders: { "x-powered-by": "CORS Anywhere" },
    setHeaders: {
      host: "register.cgmh.org.tw",
      "Access-Control-Allow-Origin": "*",
      cookie:
        "_ga_8R57LPN6MP=GS1.1.1698718716.1.0.1698718725.0.0.0; _gid=GA1.3.557618731.1700801114; __RequestVerificationToken=umhDyRslWR8kZha5t_08zb9AHeNTi_EvDzNFBc55OoLz2ExHx6GXAQoiCCG1NlqSPuWEW9wgRZbx6o-h20NP10povLXP0eBCZeJkYu2Ov_I1; ASP.NET_SessionId=lloosaajjzkmwh2wwh5z0bal; _gat_gtag_UA_90543533_1=1; _ga=GA1.1.212579818.1698718717; _ga_C1C7DKWL0J=GS1.1.1700822255.5.1.1700824694.0.0.0",
      "content-type": "application/x-www-form-urlencoded",
    },
    redirectSameOrigin: true,
    httpProxyOptions: {
      // Do not add X-Forwarded-For, etc. headers, because Heroku already adds it.
      xfwd: false,
    },
  })
  .listen(port, host, function () {
    console.log("Running CORS Anywhere on " + host + ":" + port);
  });

cors_proxy
  .createServer({
    originBlacklist: originBlacklist,
    //originWhitelist: originWhitelist,
    originWhitelist: [], // Allow all origins
    //requireHeader: ["origin", "x-requested-with"],
    checkRateLimit: checkRateLimit,
    removeHeaders: [
      "cookie",
      "cookie2",
      // Strip Heroku-specific headers
      "x-request-start",
      "x-request-id",
      "via",
      "connect-time",
      "total-route-time",
      "x-invoke-output",
      "x-forwarded-for",
      "x-forwarded-proto",
      "x-forwarded-port",
      "x-forwarded-host",
      "x-invoke-query",
      "x-invoke-path",
      "x-middleware-invoke",
      // Other Heroku added debug headers
      // 'x-forwarded-for',
      // 'x-forwarded-proto',
      // 'x-forwarded-port',
    ],
    //setHeaders: { "x-powered-by": "CORS Anywhere" },
    setHeaders: {
      host: "register.cgmh.org.tw",
      "Access-Control-Allow-Origin": "*",
      cookie:
        "_ga_8R57LPN6MP=GS1.1.1698718716.1.0.1698718725.0.0.0; _gid=GA1.3.557618731.1700801114; __RequestVerificationToken=umhDyRslWR8kZha5t_08zb9AHeNTi_EvDzNFBc55OoLz2ExHx6GXAQoiCCG1NlqSPuWEW9wgRZbx6o-h20NP10povLXP0eBCZeJkYu2Ov_I1; ASP.NET_SessionId=lloosaajjzkmwh2wwh5z0bal; _gat_gtag_UA_90543533_1=1; _ga=GA1.1.212579818.1698718717; _ga_C1C7DKWL0J=GS1.1.1700822255.5.1.1700824694.0.0.0",
      "content-type": "application/x-www-form-urlencoded",
    },
    redirectSameOrigin: true,
    httpProxyOptions: {
      // Do not add X-Forwarded-For, etc. headers, because Heroku already adds it.
      xfwd: false,
    },
    httpsOptions: {
      key: fs.readFileSync(path.join(__dirname, "key.pem")),
      cert: fs.readFileSync(path.join(__dirname, "cert.pem")),
    },
  })
  .listen(port_https, host, function () {
    console.log("Running CORS Anywhere https on " + host + ":" + port_https);
  });
