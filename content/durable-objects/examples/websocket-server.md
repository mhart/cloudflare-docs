---
type: example
summary: Build a WebSocket server using Durable Objects and Workers.
tags:
  - Durable Objects
pcx_content_type: example
title: Build a WebSocket server 
weight: 3
layout: example
---

This example shows how to build a WebSocket server using Durable Objects and Workers. The example exposes an endpoint to create a new WebSocket connection. This WebSocket connection echos any message while including the total number of WebSocket connections currently established. For more information, refer to [Use Durable Objects with WebSockets](/durable-objects/reference/websockets/).

{{<Aside type="warning">}}

WebSocket connections pin your Durable Object to memory, and so duration charges will be incurred so long as the WebSocket is connected (regardless of activity). To avoid duration charges during periods of inactivity, use the [WebSocket Hibernation API](/durable-objects/examples/websocket-hibernation-server/), which only charges for duration when JavaScript is actively executing.

{{</Aside>}}

{{<tabs labels="js | ts">}}
{{<tab label="js" default="true">}}

```js
---
filename: index.js
---
import { DurableObject } from "cloudflare:workers";

// Worker
export default {
  async fetch(request, env, ctx) {
    if (request.url.endsWith("/websocket")) {
      // Expect to receive a WebSocket Upgrade request.
      // If there is one, accept the request and return a WebSocket Response.
      const upgradeHeader = request.headers.get('Upgrade');
      if (!upgradeHeader || upgradeHeader !== 'websocket') {
        return new Response('Durable Object expected Upgrade: websocket', { status: 426 });
      }

      // This example will refer to the same Durable Object instance,
      // since the name "foo" is hardcoded.
      let id = env.WEBSOCKET_SERVER.idFromName("foo");
      let stub = env.WEBSOCKET_SERVER.get(id);

      return stub.fetch(request);
    }

    return new Response(null, {
      status: 400,
      statusText: 'Bad Request',
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
};

// Durable Object
export class WebSocketServer extends DurableObject {
  currentlyConnectedWebSockets;

  constructor(ctx, env) {
    // This is reset whenever the constructor runs because
    // regular WebSockets do not survive Durable Object resets.
    //
    // WebSockets accepted via the Hibernation API can survive
    // a certain type of eviction, but we will not cover that here.
    super(ctx, env);
    this.currentlyConnectedWebSockets = 0;
  }

  async fetch(request) {
    // Creates two ends of a WebSocket connection.
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);
  
    // Calling `accept()` tells the runtime that this WebSocket is to begin terminating
    // request within the Durable Object. It has the effect of "accepting" the connection,
    // and allowing the WebSocket to send and receive messages.
    server.accept();
    this.currentlyConnectedWebSockets += 1;

    // Upon receiving a message from the client, the server replies with the same message,
    // and the total number of connections with the "[Durable Object]: " prefix
    server.addEventListener('message', (event) => {
      server.send(`[Durable Object] currentlyConnectedWebSockets: ${this.currentlyConnectedWebSockets}`);
    });

    // If the client closes the connection, the runtime will close the connection too.
    server.addEventListener('close', (cls) => {
      this.currentlyConnectedWebSockets -= 1;
      server.close(cls.code, "Durable Object is closing WebSocket");
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
}
```

{{</tab>}}
{{<tab label="ts">}}

```ts
---
filename: index.ts
---
import { DurableObject } from "cloudflare:workers";

export interface Env {
  WEBSOCKET_SERVER: DurableObjectNamespace<WebSocketServer>;
}

// Worker
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.url.endsWith("/websocket")) {
      // Expect to receive a WebSocket Upgrade request.
      // If there is one, accept the request and return a WebSocket Response.
      const upgradeHeader = request.headers.get('Upgrade');
      if (!upgradeHeader || upgradeHeader !== 'websocket') {
        return new Response('Durable Object expected Upgrade: websocket', { status: 426 });
      }

      // This example will refer to the same Durable Object instance,
      // since the name "foo" is hardcoded.
      let id = env.WEBSOCKET_SERVER.idFromName("foo");
      let stub = env.WEBSOCKET_SERVER.get(id);

      return stub.fetch(request);
    }

    return new Response(null, {
      status: 400,
      statusText: 'Bad Request',
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
};

// Durable Object
export class WebSocketServer extends DurableObject {
  currentlyConnectedWebSockets: number;

  constructor(ctx: DurableObjectState, env: Env) {
    // This is reset whenever the constructor runs because
    // regular WebSockets do not survive Durable Object resets.
    //
    // WebSockets accepted via the Hibernation API can survive
    // a certain type of eviction, but we will not cover that here.
    super(ctx, env);
    this.currentlyConnectedWebSockets = 0;
  }

  async fetch(request: Request): Promise<Response> {
    // Creates two ends of a WebSocket connection.
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);
  
    // Calling `accept()` tells the runtime that this WebSocket is to begin terminating
    // request within the Durable Object. It has the effect of "accepting" the connection,
    // and allowing the WebSocket to send and receive messages.
    server.accept();
    this.currentlyConnectedWebSockets += 1;

    // Upon receiving a message from the client, the server replies with the same message,
    // and the total number of connections with the "[Durable Object]: " prefix
    server.addEventListener('message', (event: MessageEvent) => {
      server.send(`[Durable Object] currentlyConnectedWebSockets: ${this.currentlyConnectedWebSockets}`);
    });

    // If the client closes the connection, the runtime will close the connection too.
    server.addEventListener('close', (cls: CloseEvent) => {
      this.currentlyConnectedWebSockets -= 1;
      server.close(cls.code, "Durable Object is closing WebSocket");
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
}
```

{{</tab>}}
{{</tabs>}}

Finally, configure your `wrangler.toml` file to include a Durable Object [binding](/durable-objects/get-started/#5-configure-durable-object-bindings) and [migration](/durable-objects/reference/durable-objects-migrations/) based on the namespace and class name chosen previously.

```toml
---
filename: wrangler.toml
---
name = "websocket-server"

[[durable_objects.bindings]]
name = "WEBSOCKET_SERVER"
class_name = "WebSocketServer"

[[migrations]]
tag = "v1"
new_classes = ["WebSocketServer"]
```
### Related resources

- [Durable Objects: Edge Chat Demo](https://github.com/cloudflare/workers-chat-demo).