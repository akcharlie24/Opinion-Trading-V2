import { WebSocket, WebSocketServer } from "ws";
import { pubSubManager } from "./PubSubManagerSockets";

const subscribedUsers: Map<string, Set<WebSocket>> = new Map();
const stocksToListen: Set<string> = new Set();

async function startWebSocket() {
  const subscriberClient = pubSubManager;
  await subscriberClient.connectToRedis();

  function broadcastMessage(stockSymbol: string, data: string) {
    const subscribers = subscribedUsers.get(stockSymbol);
    if (!subscribers) return;
    subscribers.forEach((ws) => {
      ws.send(data);
    });
  }

  async function addListenerToStock(stockSymbol: string): Promise<void> {
    await subscriberClient.connectToRedis();
    await subscriberClient.listenForSymbol(stockSymbol, (data) => {
      console.log(data);
      broadcastMessage(stockSymbol, data);
    });
  }

  async function susbscribeToStock(
    stockSymbol: string,
    ws: WebSocket,
  ): Promise<void> {
    if (subscribedUsers.has(stockSymbol)) {
      const clients = subscribedUsers.get(stockSymbol);
      if (clients!.has(ws)) {
        ws.send("You are alerady subscribed");
        return;
      }
      clients!.add(ws);
    } else if (!subscribedUsers.has(stockSymbol)) {
      const clients: Set<WebSocket> = new Set();
      clients.add(ws);
      subscribedUsers.set(stockSymbol, clients);
    }

    // wrong thing here is i am adding multiple listeners to same stock and this is not right
    // await addListenerToStock(stockSymbol);

    if (stocksToListen.has(stockSymbol)) {
      ws.send("Subscribed Successfully");
      return;
    } else if (!stocksToListen.has(stockSymbol)) {
      stocksToListen.add(stockSymbol);
      await addListenerToStock(stockSymbol);

      ws.send("Subscribed Successfully");
      return;
    }
  }

  async function unsubscribeFromStock(stockSymbol: string, ws: WebSocket) {
    if (!subscribedUsers.has(stockSymbol)) {
      ws.send("No stock to unsubscribe from");
      return;
    }
    const clients = subscribedUsers.get(stockSymbol);
    if (!clients!.has(ws)) {
      ws.send("Not yet subscribed");
      return;
    }

    // TODO: put in try catch later on
    clients!.delete(ws);
    if (clients!.size === 0) {
      subscribedUsers.delete(stockSymbol);
      await subscriberClient.connectToRedis();
      await subscriberClient.unsubscribeFromStock(stockSymbol);
    }

    if (!subscribedUsers.has(stockSymbol)) {
      stocksToListen.delete(stockSymbol);
    }

    ws.send("Unsubscribed Successfully");
  }

  function cleanUpOnClose(ws: WebSocket) {
    for (const [stockSymbol, clients] of subscribedUsers.entries()) {
      if (clients.has(ws)) {
        unsubscribeFromStock(stockSymbol, ws);
      }
    }
  }

  const wss = new WebSocketServer({ port: 8080 }, () => {
    console.log(`Started Listening On 8080`);
  });

  wss.on("connection", async function connection(ws: WebSocket) {
    //@ts-ignore
    ws.on("message", function message(data) {
      const message = JSON.parse(data.toString());

      const stockSymbol = message.stockSymbol;
      const type = message.type;

      if (type === "subscribe" && stockSymbol) {
        susbscribeToStock(stockSymbol, ws);
      } else if (type === "unsubscribe" && stockSymbol) {
        unsubscribeFromStock(stockSymbol, ws);
      }
    });

    ws.send("connected to ws");

    ws.on("close", () => {
      cleanUpOnClose(ws);
    });
  });

  // TODO: will need to add cleanup functions in node processes
}

startWebSocket();
