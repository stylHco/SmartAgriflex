const PROXY_CONFIG = [
  {
    context: [
      "/_api",
      "/swagger",
    ],
    target: "http://localhost:33395",
    secure: false
  }
]

module.exports = PROXY_CONFIG;
