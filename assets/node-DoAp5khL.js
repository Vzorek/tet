function __vite__mapDeps(indexes) {
  if (!__vite__mapDeps.viteFileDeps) {
    __vite__mapDeps.viteFileDeps = []
  }
  return indexes.map((i) => __vite__mapDeps.viteFileDeps[i])
}
import{f as s}from"./index-CuGlkaG1.js";const{Worker:t,parentPort:o}=await s(()=>import("./__vite-browser-external-D7Ct-6yo.js").then(e=>e._),__vite__mapDeps([]));class a{worker;constructor(r){this.worker=new t(r)}postMessage(r){this.worker.postMessage(r)}onMessage(r){this.worker.on("message",r)}onError(r){this.worker.on("error",r)}async asyncDispose(){await this.worker.terminate()}async[Symbol.asyncDispose](){return this.asyncDispose()}static postMessageToParent(r){if(!o)throw new Error("Not running in a worker");o.postMessage(r)}static onMessageFromParent(r){if(!o)throw new Error("Not running in a worker");o.on("message",r)}static onErrorFromParent(r){if(!o)throw new Error("Not running in a worker");o.on("error",r)}}export{a as NodeWorker};
