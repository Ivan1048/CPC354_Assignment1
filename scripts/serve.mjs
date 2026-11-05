import { createServer } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import {
  dirname,
  extname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const port = Number(process.env.PORT || 5173);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

createServer(async (request, response) => {
  if (!["GET", "HEAD"].includes(request.method)) {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    if (pathname.split(/[\\/]/).some((part) => part.startsWith("."))) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    let target = await realpath(resolve(root, `.${pathname}`));
    const location = relative(root, target);
    if (
      location === ".." ||
      location.startsWith(`..${sep}`) ||
      isAbsolute(location)
    ) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    if ((await stat(target)).isDirectory())
      target = resolve(target, "index.html");
    const content = await readFile(target);
    response.writeHead(200, {
      "Content-Type": types[extname(target)] || "application/octet-stream",
      "Content-Length": content.length,
      "Cache-Control": "no-store",
    });
    response.end(request.method === "HEAD" ? undefined : content);
  } catch (error) {
    const malformed = error instanceof URIError;
    const missing = ["ENOENT", "ENOTDIR", "EISDIR"].includes(error.code);
    response
      .writeHead(malformed ? 400 : missing ? 404 : 500)
      .end(
        malformed
          ? "Bad request"
          : missing
            ? "Not found"
            : "Unable to read file",
      );
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`TV Ident Studio: http://127.0.0.1:${port}`);
});
