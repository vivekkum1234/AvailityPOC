// Polyfills for Node.js 12 compatibility
import fetch, { Headers, Request, Response } from 'node-fetch';

// Add fetch API to global scope for Node.js 12
declare global {
  var fetch: any;
  var Headers: any;
  var Request: any;
  var Response: any;
}

if (!(global as any).fetch) {
  (global as any).fetch = fetch;
  (global as any).Headers = Headers;
  (global as any).Request = Request;
  (global as any).Response = Response;
}
