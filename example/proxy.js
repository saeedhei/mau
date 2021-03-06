/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 GochoMugo <mugo@forfuture.co.ke>
 * Copyright (c) 2017 Forfuture LLC <we@forfuture.co.ke>
 *
 * This allows demonstrating scalability of the query engine.
 * This is simply a proxy that passes webhook messages to different
 * Telegram bot instances.
 */
/* eslint-disable no-console */


// built-in modules
const http = require("http");


// installed modules
const httpProxy = require("http-proxy");
const ngrok = require("ngrok");
const Tgfancy = require("tgfancy");


// module variables
const proxy = httpProxy.createProxy();
const port = parseInt(process.argv[2], 10) || 9432;
const botPorts = (process.argv[3] || "").split(",");
const server = http.Server(requestListener);
const token = process.env.TELEGRAM_TOKEN;
if (!token) {
    throw new Error("missing telegram token");
}
const bot = new Tgfancy(token);
let index = 0;


ngrok.connect(port, function(error, url) {
    if (error) throw error;
    console.log("[*] setting webhook to %s (-> http://127.0.0.1:%d)", url, port);
    bot.setWebHook(`${url}/bot${token}`).catch(function(error) {
        if (error) throw error;
    });
});


function requestListener(req, res) {
    const botPort = botPorts[index];
    if (!botPort) return;
    index++;
    if (index === botPorts.length) index = 0;
    console.log("[*] proxying to port %s", botPort);
    return proxy.web(req, res, {
        target: `http://0.0.0.0:${botPort}`,
    });
}


server.listen(port, function() {
    console.log("[*] proxy listening on port %d", port);
});
