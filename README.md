# clone-nignx

A lightweight Node.js + TypeScript reverse proxy inspired by NGINX-style path routing.

## Features

- YAML-based proxy configuration
- Path-based routing rules
- Multiple upstream targets
- Cluster worker support
- Config validation with Zod

## Prerequisites

- Node.js 18+ (recommended)
- npm

## Project Structure

- `/home/runner/work/clone-nignx/clone-nignx/src/index.ts` - CLI entry point (`--config`)
- `/home/runner/work/clone-nignx/clone-nignx/src/server.ts` - cluster + proxy server logic
- `/home/runner/work/clone-nignx/clone-nignx/src/config.ts` - YAML parsing and validation
- `/home/runner/work/clone-nignx/clone-nignx/src/config-schema.ts` - config schema definitions
- `/home/runner/work/clone-nignx/clone-nignx/config.yml` - sample proxy config

## Install

```bash
npm install
```

## How to Run

### Development mode

```bash
npm run dev
```

This compiles TypeScript in watch mode and starts the server with:

```bash
node ./dist/index.js --config config.yml
```

### Production mode

```bash
npm run build
npm start
```

`npm start` runs `dist/index.js`, so pass `--config` manually if needed:

```bash
node dist/index.js --config config.yml
```

## How to Use

1. Define upstreams and rules in `config.yml`.
2. Start the proxy server.
3. Send requests to the configured `server.listen` port (default sample: `8080`).
4. Requests are routed by path to the matching upstream.

Example:
- `GET /products` -> `dummyjson.com`
- `GET /anything-else` -> `jsonplaceholder.typicode.com`

## How to Execute (Quick Start)

```bash
cd /home/runner/work/clone-nignx/clone-nignx
npm install
npm run build
node dist/index.js --config config.yml
```

Then test in another terminal:

```bash
curl http://localhost:8080/products
curl http://localhost:8080/posts
```

## How to Modify

### 1) Change routing behavior
Edit `/home/runner/work/clone-nignx/clone-nignx/config.yml`:
- Add/remove upstreams under `server.upstream`
- Add/update path rules under `server.rules`
- Change listen port via `server.listen`
- Change worker count via `server.workers`

### 2) Change validation rules
Edit `/home/runner/work/clone-nignx/clone-nignx/src/config-schema.ts` to update config shape and constraints.

### 3) Change proxy/server logic
Edit `/home/runner/work/clone-nignx/clone-nignx/src/server.ts` for request handling, worker behavior, and upstream calls.

### 4) Rebuild after changes

```bash
npm run build
```

## Credits

- Learning source: **Piyush Garg**
- Reference video: https://youtu.be/_Ly2F7-FFSw?si=vz8g9vi1qdcIwREF
- Project repository owner: **Rahul-aithal**
