import cluster, { Worker } from "cluster";
import { ConfigSchema, rootConfigSchema } from "./config-schema";
import http from "node:http";
import {
  workerMessageReplySchema,
  workerMessageReplyType,
  workerMessageSchema,
  workerMessageType,
} from "./server-schema";
import { date } from "zod";

interface createCONFIG {
  port: number;
  workerCount: number;
  config: ConfigSchema;
}

export async function createServer(config: createCONFIG) {
  const { workerCount } = config;
  const WOKRER_POOL: Worker[] = [];
  if (cluster.isPrimary) {
    console.log(`Master Process ${process.pid} is running`);

    for (let i = 0; i < workerCount; i++) {
      const w = cluster.fork({ config: JSON.stringify(config.config) });
      WOKRER_POOL.push(w);
      console.log(`Worker Node ${i} `);
    }

    const server = http.createServer((req, res) => {
      const index = Math.floor(Math.random() * WOKRER_POOL.length);
      const worker = WOKRER_POOL.at(index);
      if (!worker) {
        throw new Error("NO WORKER FOUND");
      }

      const payload: workerMessageType = {
        requestType: "HTTP",
        headers: req.headers,
        body: null,
        url: `${req.url}`,
      };

      worker.send(JSON.stringify(payload));

      worker.on("message", (workerReply: string) => {
        const reply = workerMessageReplySchema.parse(JSON.parse(workerReply));
        if (reply.errorCode) {
          res.writeHead(parseInt(reply.errorCode));
          res.end(reply.error);
        } else {
          res.writeHead(200);
          res.end(reply.data);
        }
      });
    });

    server.listen(config.port, () => {
      console.log(
        "🥷 " + `  REVERSE PROXY IS RUNNNING ON PORT ${config.port} 🥷`
      );
    });
  } else {
    console.log(`Worker Process is running`);
    const config = await rootConfigSchema.parseAsync(
      JSON.parse(`${process.env.config}`)
    );

    process.on("message", async (message: string) => {
      const messageValidate = await workerMessageSchema.parseAsync(
        JSON.parse(message)
      );
      const requestURL = messageValidate.url;
      const rule = config.server.rules.find((e) => {
        const regex = new RegExp(`^${e.path}.*$`);
        console.log({ regex });

        return regex.test(requestURL);
      });

      if (!rule) {
        const reply: workerMessageReplyType = {
          errorCode: "404",
          error: "RULE NOT FOUND",
        };

        if (process.send) process.send(JSON.stringify(reply));
      }
      const upstreamId = rule?.upstream[0];
      const upstream = config.server.upstream.find((e) => e.id === upstreamId);
      if (!upstream) {
        const reply: workerMessageReplyType = {
          errorCode: "500",
          error: "UPSTREAM NOT FOUND",
        };

        if (process.send) process.send(JSON.stringify(reply));
      }

      // console.log({ host: upstream?.url, path: requestURL, method: "GET" });

      const httpRequest = http.request(
        {
          host: upstream?.url,
          path: requestURL,
          method: "GET",
        },
        (proxyRes) => {
          let body = "";

          proxyRes.on("data", (chunk) => {
            body += chunk;
          });

          proxyRes.on("end", () => {
            const reply: workerMessageReplyType = {
              data: body,
            };

            if (process.send) {
              process.send(JSON.stringify(reply));
            }
          });
        }
      );
      httpRequest.on("error", (err) => {
        const reply: workerMessageReplyType = {
          errorCode: "500",
          error: `Proxy Error: ${err.message}`,
        };

        if (process.send) {
          process.send(JSON.stringify(reply));
        }
      });

      httpRequest.end();
    });
  }
}
