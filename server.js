const express = require('express');
const axios = require('axios');
const cors = require('cors');
const pkg = require('pg');// Use a suitable database client like pg for PostgreSQL or mysql for MySQL
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const { KiteTicker } = require("kiteconnect");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3004;
const { Pool } = pkg;
const subdomain = require('subdomain');
const http = require('http');


const server = http.createServer(app); // Create an HTTP server

// Corrected WebSocket.Server initialization without "port"
var wssData = new WebSocket.Server({ server }); // Only use the "server" option

server.listen(7789, () => { // Now specify the port when starting the HTTP server
  console.log('Server is running on port 7789');
});

app.use(subdomain({ base: 'ws.http://localhost:3001/', removeWWW: true }));

wssData.on('connection', function(ws){
  console.log('a connection!');
});
//#endregion

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json()); 

let tickerData;
let isTickerConnectedtickerData = false;
let subscribedTokenstickerData = [];

// Initialize KiteTicker instance if not already initialized
function initializeTickertickerData(api_key, access_token) {
  if (!tickerData) {
    tickerData = new KiteTicker({ api_key, access_token });

    // Define event handlers once
    tickerData.on("ticks", onTickstickerData);
    tickerData.on("connect", onConnecttickerData);
    tickerData.on("disconnect", onDisconnecttickerData);
    tickerData.on("error", onErrortickerData);
    tickerData.on("close", onClosetickerData);
    tickerData.on("order_update", onTradetickerData);

    tickerData.connect(); // Initiate WebSocket connection
  }
}


app.get("/api/getLiveData", async (req, res) => {

  const instrument_tokens = req.body.tokens;
console.log("req.query custom",req.body)
  const api_key = req.body.api_key;
   const access_token = req.body.access_token;
   //const access_token = "4VmHOya6jQeChfeMAIk0F1U1Hw5oXEQe";

  if (!api_key || !access_token || !instrument_tokens) {
    return res.status(400).json({ error: "Missing required parameters" });
  }
  initializeTickertickerData(api_key, access_token);

  const checkAndSubscribe = () => {
    if (isTickerConnectedtickerData) {
      subscribeToTokenstickerData(instrument_tokens);
    } else {

      const interval = global.setInterval(() => {
        if (isTickerConnectedtickerData) {
          subscribeToTokenstickerData(instrument_tokens);
          global.clearInterval(interval); // Clear interval after successful subscription
        }
      }, 100);
    }

  };

  checkAndSubscribe();
  res.status(200).json({ message: "Subscription request received!" });

});

function onTickstickerData(ticks) {
  // Broadcast the ticks to all connected clients
  console.log("out")
  wssData.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) { 
      console.log("in")
      client.send(JSON.stringify({ ticks }));
    }
  });
}

// Helper function to subscribe to tokens
function subscribeToTokenstickerData(tokens) {

  // Unsubscribe from previous tokens
  if (subscribedTokenstickerData.length > 0) {
    tickerData.unsubscribe(subscribedTokenstickerData);
  }
  subscribedTokenstickerData = tokens;
  const instrumentIds = tokens.map((id) => Number(id));
  console.log("Subscribed to tokens:", instrumentIds);
  const tokenArray = Array.from(instrumentIds);
  tickerData.subscribe(tokenArray);
  tickerData.setMode(tickerData.modeFull, tokenArray);
  //   console.log("Subscribed to tokens:", tokenArray);
}

function onDisconnecttickerData(error) {
  console.log("Closed connection on disconnect", error);
}

function onErrortickerData(error) {
  console.log("Closed connection on error", error);
}

function onClosetickerData(reason) {
  console.log("Closed connection on close", reason);
}

function onTradetickerData(order) {
  console.log("Order update", order);
}

function onConnecttickerData() {
  console.log("Custom KiteTicker connected");
  isTickerConnectedtickerData = true;
}

//#endregion

// Start the server
app.listen(PORT, () => {
  console.log(`Node server running on http://localhost:${PORT}`);
});
