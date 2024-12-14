// src/shim.d.ts
declare module "web-worker" {
  const WebWorker: typeof Worker;
  export default WebWorker;
}

declare module "exceljs/dist/exceljs.min.js" {
  export * from "exceljs";
}
