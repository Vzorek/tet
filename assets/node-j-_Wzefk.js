import{ar as s}from"./index-Cw6c2zvH.js";const{Worker:t,parentPort:o}=await s(()=>import("./__vite-browser-external-D7Ct-6yo.js").then(e=>e._),[],import.meta.url);class a{worker;constructor(r){this.worker=new t(r)}postMessage(r){this.worker.postMessage(r)}onMessage(r){this.worker.on("message",r)}onError(r){this.worker.on("error",r)}async asyncDispose(){await this.worker.terminate()}async[Symbol.asyncDispose](){return this.asyncDispose()}static postMessageToParent(r){if(!o)throw new Error("Not running in a worker");o.postMessage(r)}static onMessageFromParent(r){if(!o)throw new Error("Not running in a worker");o.on("message",r)}static onErrorFromParent(r){if(!o)throw new Error("Not running in a worker");o.on("error",r)}}export{a as NodeWorker};
