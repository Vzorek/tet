import{T as F,E as k,ah as $,ai as R,aj as D,f as G,a7 as W,ak as Q,al as z,am as V,a8 as q}from"./index-DFqGDcRD.js";class K{parent;name;_state;_events;_eventEmitter=new F;constructor(e,t,i,s){this.parent=e,this.name=t,this._state=i,this._events=s}addListener(e,t){return this._eventEmitter.addListener(e,t),this}on(e,t){return this._eventEmitter.on(e,t),this}once(e,t){return this._eventEmitter.once(e,t),this}prependListener(e,t){return this._eventEmitter.prependListener(e,t),this}prependOnceListener(e,t){return this._eventEmitter.prependOnceListener(e,t),this}off(e,t){return this._eventEmitter.off(e,t),this}removeAllListeners(e){return this._eventEmitter.removeAllListeners(e),this}removeListener(e,t){return this._eventEmitter.removeListener(e,t),this}emit(e,...t){return this._eventEmitter.emit(e,...t)}eventNames(){return this._eventEmitter.eventNames()}rawListeners(e){return this._eventEmitter.rawListeners(e)}listeners(e){return this._eventEmitter.listeners(e)}listenerCount(e){return this._eventEmitter.listenerCount(e)}getMaxListeners(){return this._eventEmitter.getMaxListeners()}setMaxListeners(e){return this._eventEmitter.setMaxListeners(e),this}}class X extends F{#e=new Map;#t=new Map;#n=new Map;registerDeviceClass(e){this.#e.set(e.name,e)}createDevice(e,t,i){const s=this.#e.get(e);if(!s)throw console.log(`Device classes: ${JSON.stringify(Array.from(this.#e.keys()))}`),new Error(`Device class with name "${e}" does not exist`);const r=i?JSON.parse(JSON.stringify(i)):void 0,o=i?s._state.decode(r):void 0;if(o&&k.isLeft(o))throw new Error(`Invalid initial state for device "${t}": ${JSON.stringify(r)}`);const a=o?o.right:$(s._state);console.log(`Creating device with state: ${R(a)}`);const c={id:t,deviceClass:s,state:a};return this.#t.set(c.id,c),c}linkDeviceType(e,t){if(!this.#e.get(e))throw new Error(`Device class with name "${e}" does not exist`);this.#n.set(t,e)}addDevice(e,t){const i=this.#n.get(e);if(!i)throw new Error(`No device class linked to tag "${e}"`);return this.createDevice(i,t)}updateDeviceState(e,t,i){const s=this.#t.get(t);if(!s||s.deviceClass.name!==e)throw new Error(`Device with id "${t}" does not exist`);console.log(`Updating device state: ${R(i)}`);const r=JSON.parse(JSON.stringify(i));s.state=r,this.emit("deviceStateChange",{id:t,state:r})}getDeviceClass(e){return this.#e.get(e)}getDevice(e){return this.#t.get(e)}getDevices(){return Array.from(this.#t.values())}getDeviceClasses(){return Array.from(this.#e.values())}getDevicesByClass(e){return Array.from(this.#t.values()).filter(t=>t.deviceClass.name===e)}getLinks(){return this.#n}defineDeviceClass(e,t,i){const s=new K(this,e,t,i);return this.registerDeviceClass(s),s}resolveDevice({id:e,tag:t}){return this.#t.get(e)||this.addDevice(t,e)}receiveEvent(e){try{const t=this.resolveDevice(e.source),i=structuredClone(t.state);t.deviceClass.emit(e.event.event,e.source.id,e.event.data,i)}catch(t){console.error("Error while handling event:",t)}}}var Y={type:"sync",importFFI:()=>D(()=>import("./ffi-DGtPOqi5.js"),[],import.meta.url).then(n=>n.QuickJSFFI),importModuleLoader:()=>D(()=>import("./emscripten-module.browser-CQTyY9rm.js"),[],import.meta.url).then(n=>n.default)},Z=Y;async function ee(n){let e=j(await n),[t,i,{QuickJSWASMModule:s}]=await Promise.all([e.importModuleLoader().then(j),e.importFFI(),D(()=>import("./module-HMQCEAUF-CYYojbOj.js"),[],import.meta.url).then(j)]),r=await t();r.type="sync";let o=new i(r);return new s(r,o)}function j(n){return n&&"default"in n&&n.default?n.default&&"default"in n.default&&n.default.default?n.default.default:n.default:n}var te=Object.defineProperty,ne=(n,e,t)=>e in n?te(n,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):n[e]=t,p=(n,e,t)=>(ne(n,typeof e!="symbol"?e+"":e,t),t);const se=n=>{const e=new re(n);return new Proxy(n,{get(t,i,s){return i in e?e[i]:Reflect.get(t,i,s)}})};class re{constructor(e){p(this,"context"),p(this,"fn"),p(this,"fnGenerator"),p(this,"fnCounter",Number.MIN_SAFE_INTEGER),p(this,"fnMap",new Map),p(this,"newFunction",(i,s)=>{this.fnCounter++;const r=this.fnCounter;return this.fnMap.set(r,s),this.context.unwrapResult(this.context.callFunction(this.fnGenerator,this.context.undefined,this.context.newString(i),this.context.newNumber(s.length),this.context.newNumber(r),this.fn))}),this.context=e;const t=this.fnMap;this.fn=this.context.newFunction("",function(i,...s){const r=e.getNumber(i),o=t.get(r);if(!o)throw new Error("function is not registered");return o.call(this,...s)}),this.fnGenerator=e.unwrapResult(e.evalCode(`((name, length, id, f) => {
        const fn = function(...args) {
          return f.call(this, id, ...args);
        };
        fn.name = name;
        fn.length = length;
        return fn;
      })`))}disposeEx(){this.fnGenerator.dispose(),this.fn.dispose()}}const ie=[[Symbol,"Symbol"],[Symbol.prototype,"Symbol.prototype"],[Object,"Object"],[Object.prototype,"Object.prototype"],[Function,"Function"],[Function.prototype,"Function.prototype"],[Boolean,"Boolean"],[Boolean.prototype,"Boolean.prototype"],[Array,"Array"],[Array.prototype,"Array.prototype"],[Error,"Error"],[Error.prototype,"Error.prototype"],[EvalError,"EvalError"],[EvalError.prototype,"EvalError.prototype"],[RangeError,"RangeError"],[RangeError.prototype,"RangeError.prototype"],[ReferenceError,"ReferenceError"],[ReferenceError.prototype,"ReferenceError.prototype"],[SyntaxError,"SyntaxError"],[SyntaxError.prototype,"SyntaxError.prototype"],[TypeError,"TypeError"],[TypeError.prototype,"TypeError.prototype"],[URIError,"URIError"],[URIError.prototype,"URIError.prototype"],...Object.getOwnPropertyNames(Symbol).filter(n=>typeof Symbol[n]=="symbol").map(n=>[Symbol[n],`Symbol.${n}`])];function oe(n,e){const t=n.unwrapResult(n.evalCode(e)),i=(s,...r)=>n.unwrapResult(n.callFunction(t,s??n.undefined,...r));return i.dispose=()=>t.dispose(),i.alive=!0,Object.defineProperty(i,"alive",{get:()=>t.alive}),i}function v(n,e,t,...i){const s=oe(n,e);try{return s(t,...i)}finally{s.dispose()}}function ae(n,e,t){return n.dump(v(n,"Object.is",void 0,e,t))}function ce(n,e,t){return n.dump(v(n,"(a, b) => a instanceof b",void 0,e,t))}function le(n,e){return n.dump(v(n,'a => typeof a === "object" && a !== null || typeof a === "function"',void 0,e))}function ue(n,e){const t=JSON.stringify(e);return t?v(n,"JSON.parse",void 0,n.newString(t)):n.undefined}function pe([n,e],t){try{return t(n)}finally{e&&n.dispose()}}function O(n,e){try{return e(...n.map(t=>t[0]))}finally{for(const[t,i]of n)i&&t.dispose()}}function de(n){return"handle"in n}function he(n){return de(n)?n.handle:n}function fe(n,e,t,i){var s;let r;for(const o of i)if(r=o(e,n),r)break;return r?(s=t(e,r))!=null?s:r:void 0}function me(n,e){return typeof n!="symbol"?void 0:v(e,"d => Symbol(d)",void 0,n.description?e.newString(n.description):e.undefined)}function ye(n,e){return n instanceof Date?v(e,"d => new Date(d)",void 0,e.newNumber(n.getTime())):void 0}const ve=[me,ye];function _e(n){return typeof n=="function"&&/^class\s/.test(Function.prototype.toString.call(n))}function w(n){return typeof n=="function"||typeof n=="object"&&n!==null}function ge(n,e){const t=new Set,i=s=>{if(!(!w(s)||t.has(s)||e?.(s,t)===!1)){if(t.add(s),Array.isArray(s)){for(const r of s)i(r);return}if(typeof s=="object"){const r=Object.getPrototypeOf(s);r&&r!==Object.prototype&&i(r)}for(const r of Object.values(Object.getOwnPropertyDescriptors(s)))"value"in r&&i(r.value),"get"in r&&i(r.get),"set"in r&&i(r.set)}};return i(n),t}function be(){let n=()=>{},e=()=>{};return{promise:new Promise((t,i)=>{n=t,e=i}),resolve:n,reject:e}}function N(n,e,t,i){const s=n.newObject(),r=(a,c)=>{const u=i(a),d=typeof c.value>"u"?void 0:i(c.value),l=typeof c.get>"u"?void 0:i(c.get),h=typeof c.set>"u"?void 0:i(c.set);n.newObject().consume(f=>{Object.entries(c).forEach(([m,_])=>{const g=m==="value"?d:m==="get"?l:m==="set"?h:_?n.true:n.false;g&&n.setProp(f,m,g)}),n.setProp(s,u,f)})},o=Object.getOwnPropertyDescriptors(e);Object.entries(o).forEach(([a,c])=>r(a,c)),Object.getOwnPropertySymbols(o).forEach(a=>r(a,o[a])),v(n,"Object.defineProperties",void 0,t,s).dispose(),s.dispose()}function we(n,e,t,i,s,r){var o;if(typeof e!="function")return;const a=n.newFunction(e.name,function(...u){const d=i(this),l=u.map(h=>i(h));if(_e(e)&&w(d)){const h=new e(...l);return Object.entries(h).forEach(([f,m])=>{n.setProp(this,f,t(m))}),this}return t(r?r(e,d,l):e.apply(d,l))}).consume(u=>v(n,`Cls => {
          const fn = function(...args) { return Cls.apply(this, args); };
          fn.name = Cls.name;
          fn.length = Cls.length;
          return fn;
        }`,void 0,u)),c=(o=s(e,a))!=null?o:a;return N(n,e,a,t),c}function Ee(n,e,t){var i;const s=ue(n,e);return(i=t(e,s))!=null?i:s}function ke(n,e,t,i){var s;if(typeof e!="object"||e===null)return;const r=Array.isArray(e)?n.newArray():n.newObject(),o=(s=i(e,r))!=null?s:r,a=Object.getPrototypeOf(e),c=a&&a!==Object.prototype&&a!==Array.prototype?t(a):void 0;return c&&v(n,"Object.setPrototypeOf",void 0,o,c).dispose(),N(n,e,r,t),o}function Se(n,e){switch(typeof e){case"undefined":return n.undefined;case"number":return n.newNumber(e);case"string":return n.newString(e);case"boolean":return e?n.true:n.false;case"object":return e===null?n.null:void 0}}function xe(n,e,t,i){var s;if(!(e instanceof Promise))return;const r=n.newPromise();return e.then(o=>r.resolve(t(o)),o=>r.reject(t(o))),(s=i(e,r))!=null?s:r.handle}function L(n,e){var t,i,s,r,o;const{ctx:a,unmarshal:c,isMarshalable:u,find:d,pre:l}=e;{const _=Se(a,n);if(_)return _}{const _=d(n);if(_)return _}const h=u?.(n);if(h===!1)return a.undefined;const f=(_,g)=>l(_,g,h);if(h==="json")return Ee(a,n,f);const m=_=>L(_,e);return(o=(r=(s=(i=fe(a,n,f,[...ve,...(t=e.custom)!=null?t:[]]))!=null?i:xe(a,n,m,f))!=null?s:we(a,n,m,c,f,e.preApply))!=null?r:ke(a,n,m,f))!=null?o:a.undefined}function je(n,e,t,i){var s;let r;for(const o of i)if(r=o(e,n),r)break;return r?(s=t(r,e))!=null?s:r:void 0}function De(n,e){if(e.typeof(n)!=="symbol")return;const t=e.getString(e.getProp(n,"description"));return Symbol(t)}function Oe(n,e){if(!e.dump(v(e,"a => a instanceof Date",void 0,n)))return;const t=e.getNumber(v(e,"a => a.getTime()",void 0,n));return new Date(t)}const Me=[De,Oe];function H(n,e,t,i){n.newFunction("",(s,r)=>{const[o]=i(s);if(typeof o!="string"&&typeof o!="number"&&typeof o!="symbol")return;const a=[["value",!0],["get",!0],["set",!0],["configurable",!1],["enumerable",!1],["writable",!1]].reduce((c,[u,d])=>{const l=n.getProp(r,u),h=n.typeof(l);if(h==="undefined")return c;if(!d&&h==="boolean")return c[u]=n.dump(n.getProp(r,u)),c;const[f,m]=i(l);return m&&l.dispose(),c[u]=f,c},{});Object.defineProperty(t,o,a)}).consume(s=>{v(n,`(o, fn) => {
        const descs = Object.getOwnPropertyDescriptors(o);
        Object.entries(descs).forEach(([k, v]) => fn(k, v));
        Object.getOwnPropertySymbols(descs).forEach(k => fn(k, descs[k]));
      }`,void 0,e,s).dispose()})}function Pe(n,e,t,i,s){var r;if(n.typeof(e)!=="function")return;const o=function(...c){return O([t(this),...c.map(u=>t(u))],(u,...d)=>{if(new.target){const[m]=i(v(n,"(Cls, ...args) => new Cls(...args)",u,e,...d));return Object.defineProperties(this,Object.getOwnPropertyDescriptors(m)),this}const l=n.unwrapResult(n.callFunction(e,u,...d)),[h,f]=i(l);return f&&l.dispose(),h})},a=(r=s(o,e))!=null?r:o;return H(n,e,o,i),a}function Ce(n,e,t,i){var s;if(n.typeof(e)!=="object"||n.unwrapResult(n.evalCode("o => o === null")).consume(c=>n.dump(n.unwrapResult(n.callFunction(c,n.undefined,e)))))return;const r=v(n,"Array.isArray",void 0,e).consume(c=>n.dump(c))?[]:{},o=(s=i(r,e))!=null?s:r,a=v(n,`o => {
      const p = Object.getPrototypeOf(o);
      return !p || p === Object.prototype || p === Array.prototype ? undefined : p;
    }`,void 0,e).consume(c=>{if(n.typeof(c)==="undefined")return;const[u]=t(c);return u});return typeof a=="object"&&Object.setPrototypeOf(o,a),H(n,e,r,t),o}function Re(n,e){const t=n.typeof(e);return t==="undefined"||t==="number"||t==="string"||t==="boolean"?[n.dump(e),!0]:t==="object"&&n.unwrapResult(n.evalCode("a => a === null")).consume(i=>n.dump(n.unwrapResult(n.callFunction(i,n.undefined,e))))?[null,!0]:[void 0,!1]}function Ae(n,e,t,i){var s;if(!Fe(n,e))return;const r=be(),[o,a]=t(r.resolve),[c,u]=t(r.reject);return v(n,"(p, res, rej) => { p.then(res, rej); }",void 0,e,o,c),a&&o.dispose(),u&&c.dispose(),(s=i(r.promise,e))!=null?s:r.promise}function Fe(n,e){return e.owner?n.unwrapResult(n.evalCode("Promise")).consume(t=>e.owner?ce(n,e,t):!1):!1}function Ne(n,e){const[t]=J(n,e);return t}function J(n,e){var t,i,s,r;const{ctx:o,marshal:a,find:c,pre:u}=e;{const[l,h]=Re(o,n);if(h)return[l,!1]}{const l=c(n);if(l)return[l,!0]}const d=l=>J(l,e);return[(r=(s=(i=je(o,n,u,[...Me,...(t=e.custom)!=null?t:[]]))!=null?i:Ae(o,n,a,u))!=null?s:Pe(o,n,a,d,u))!=null?r:Ce(o,n,d,u),!1]}class A{constructor(e){p(this,"ctx"),p(this,"_map1",new Map),p(this,"_map2",new Map),p(this,"_map3",new Map),p(this,"_map4",new Map),p(this,"_counterMap",new Map),p(this,"_disposables",new Set),p(this,"_mapGet"),p(this,"_mapSet"),p(this,"_mapDelete"),p(this,"_mapClear"),p(this,"_counter",Number.MIN_SAFE_INTEGER),this.ctx=e;const t=e.unwrapResult(e.evalCode(`() => {
        const mapSym = new Map();
        let map = new WeakMap();
        let map2 = new WeakMap();
        const isObj = o => typeof o === "object" && o !== null || typeof o === "function";
        return {
          get: key => mapSym.get(key) ?? map.get(key) ?? map2.get(key) ?? -1,
          set: (key, value, key2) => {
            if (typeof key === "symbol") mapSym.set(key, value);
            if (isObj(key)) map.set(key, value);
            if (isObj(key2)) map2.set(key2, value);
          },
          delete: (key, key2) => {
            mapSym.delete(key);
            map.delete(key);
            map2.delete(key2);
          },
          clear: () => {
            mapSym.clear();
            map = new WeakMap();
            map2 = new WeakMap();
          }
        };
      }`)).consume(i=>this._call(i,void 0));this._mapGet=e.getProp(t,"get"),this._mapSet=e.getProp(t,"set"),this._mapDelete=e.getProp(t,"delete"),this._mapClear=e.getProp(t,"clear"),t.dispose(),this._disposables.add(this._mapGet),this._disposables.add(this._mapSet),this._disposables.add(this._mapDelete),this._disposables.add(this._mapClear)}set(e,t,i,s){var r;if(!t.alive||s&&!s.alive)return!1;const o=(r=this.get(e))!=null?r:this.get(i);if(o)return o===t||o===s;const a=this._counter++;return this._map1.set(e,a),this._map3.set(a,t),this._counterMap.set(a,e),i&&(this._map2.set(i,a),s&&this._map4.set(a,s)),this.ctx.newNumber(a).consume(c=>{this._call(this._mapSet,void 0,t,c,s??this.ctx.undefined)}),!0}merge(e){if(e)for(const t of e)t&&t[1]&&this.set(t[0],t[1],t[2],t[3])}get(e){var t;const i=(t=this._map1.get(e))!=null?t:this._map2.get(e),s=typeof i=="number"?this._map3.get(i):void 0;if(s){if(!s.alive){this.delete(e);return}return s}}getByHandle(e){if(e.alive)return this._counterMap.get(this.ctx.getNumber(this._call(this._mapGet,void 0,e)))}has(e){return!!this.get(e)}hasHandle(e){return typeof this.getByHandle(e)<"u"}keys(){return this._map1.keys()}delete(e,t){var i;const s=(i=this._map1.get(e))!=null?i:this._map2.get(e);if(typeof s>"u")return;const r=this._map3.get(s),o=this._map4.get(s);this._call(this._mapDelete,void 0,...[r,o].filter(a=>!!(a!=null&&a.alive))),this._map1.delete(e),this._map2.delete(e),this._map3.delete(s),this._map4.delete(s);for(const[a,c]of this._map1)if(c===s){this._map1.delete(a);break}for(const[a,c]of this._map2)if(c===s){this._map2.delete(a);break}for(const[a,c]of this._counterMap)if(c===e){this._counterMap.delete(a);break}t&&(r!=null&&r.alive&&r.dispose(),o!=null&&o.alive&&o.dispose())}deleteByHandle(e,t){const i=this.getByHandle(e);typeof i<"u"&&this.delete(i,t)}clear(){this._counter=0,this._map1.clear(),this._map2.clear(),this._map3.clear(),this._map4.clear(),this._counterMap.clear(),this._mapClear.alive&&this._call(this._mapClear,void 0)}dispose(){for(const e of this._disposables.values())e.alive&&e.dispose();for(const e of this._map3.values())e.alive&&e.dispose();for(const e of this._map4.values())e.alive&&e.dispose();this._disposables.clear(),this.clear()}get size(){return this._map1.size}[Symbol.iterator](){const e=this._map1.keys();return{next:()=>{for(;;){const t=e.next();if(t.done)return{value:void 0,done:!0};const i=this._map1.get(t.value);if(typeof i>"u")continue;const s=this._map3.get(i),r=this._map4.get(i);if(!s)continue;const o=this._get2(i);return{value:[t.value,s,o,r],done:!1}}}}}_get2(e){for(const[t,i]of this._map2)if(i===e)return t}_call(e,t,...i){return this.ctx.unwrapResult(this.ctx.callFunction(e,typeof t>"u"?this.ctx.undefined:t,...i))}}function Le(n,e,t,i,s,r,o){if(!w(e)||e instanceof Promise||e instanceof Date||o&&!o(e))return;if(Je(e,t))return e;const a=new Proxy(e,{get(c,u){return u===t?c:Reflect.get(c,u)},set(c,u,d,l){var h;const f=x(d,t),m=(h=r?.(l))!=null?h:"host";return m!=="vm"&&!Reflect.set(c,u,f,l)||m==="host"||!n.alive||O([s(l),s(u),s(f)],(_,g,P)=>{const[C,B]=M(n,_,i);B?C.consume(U=>n.setProp(U,g,P)):n.setProp(C,g,P)}),!0},deleteProperty(c,u){var d;const l=(d=r?.(a))!=null?d:"host";return O([s(a),s(u)],(h,f)=>{const[m,_]=M(n,h,i);if(l==="vm"||Reflect.deleteProperty(c,u)){if(l==="host"||!n.alive)return!0;_?m.consume(g=>v(n,"(a, b) => delete a[b]",void 0,g,f)):v(n,"(a, b) => delete a[b]",void 0,m,f)}return!0})}});return a}function He(n,e,t,i,s,r,o){if(!le(n,e)||o&&!o(e,n))return[void 0,!1];if(T(n,e,i))return[e,!1];const a=d=>{const l=r?.(s(d));return typeof l=="string"?n.newString(l):n.undefined},c=(d,l,h)=>{const f=s(d);if(!f)return;const m=s(l);if(m==="__proto__")return;const _=s(h);x(f,t)[m]=_},u=(d,l)=>{const h=s(d);if(!h)return;const f=s(l);delete x(h,t)[f]};return n.newFunction("proxyFuncs",(d,...l)=>{switch(n.getNumber(d)){case 1:return a(l[0]);case 2:return c(l[0],l[1],l[2]);case 3:return u(l[0],l[1])}return n.undefined}).consume(d=>[v(n,`(target, sym, proxyFuncs) => {
          const rec =  new Proxy(target, {
            get(obj, key, receiver) {
              return key === sym ? obj : Reflect.get(obj, key, receiver)
            },
            set(obj, key, value, receiver) {
              const v = typeof value === "object" && value !== null || typeof value === "function"
                ? value[sym] ?? value
                : value;
              const sync = proxyFuncs(1, receiver) ?? "vm";
              if (sync === "host" || Reflect.set(obj, key, v, receiver)) {
                if (sync !== "vm") {
                  proxyFuncs(2, receiver, key, v);
                }
              }
              return true;
            },
            deleteProperty(obj, key) {
              const sync = proxyFuncs(1, rec) ?? "vm";
              if (sync === "host" || Reflect.deleteProperty(obj, key)) {
                if (sync !== "vm") {
                  proxyFuncs(3, rec, key);
                }
              }
              return true;
            },
          });
          return rec;
        }`,void 0,e,i,d),!0])}function x(n,e){var t;return w(n)&&(t=n[e])!=null?t:n}function M(n,e,t){return T(n,e,t)?[n.getProp(e,t),!0]:[e,!1]}function Je(n,e){return w(n)&&!!n[e]}function T(n,e,t){return!!n.dump(v(n,'(a, s) => (a instanceof Promise) || (a instanceof Date) || (typeof a === "object" && a !== null || typeof a === "function") && !!a[s]',void 0,e,t))}class Te{constructor(e,t){p(this,"context"),p(this,"_map"),p(this,"_registeredMap"),p(this,"_registeredMapDispose",new Set),p(this,"_sync",new Set),p(this,"_temporalSync",new Set),p(this,"_symbol",Symbol()),p(this,"_symbolHandle"),p(this,"_options"),p(this,"_isMarshalable",s=>{var r,o;const a=(r=this._options)==null?void 0:r.isMarshalable;return(o=typeof a=="function"?a(this._unwrap(s)):a)!=null?o:"json"}),p(this,"_marshalFind",s=>{var r,o,a;const c=this._unwrap(s);return(a=(o=(r=this._registeredMap.get(s))!=null?r:c!==s?this._registeredMap.get(c):void 0)!=null?o:this._map.get(s))!=null?a:c!==s?this._map.get(c):void 0}),p(this,"_marshalPre",(s,r,o)=>{var a;if(o!=="json")return(a=this._register(s,he(r),this._map))==null?void 0:a[1]}),p(this,"_marshalPreApply",(s,r,o)=>{const a=w(r)?this._unwrap(r):void 0;a&&this._temporalSync.add(a);try{return s.apply(r,o)}finally{a&&this._temporalSync.delete(a)}}),p(this,"_marshal",s=>{var r,o;const a=this._registeredMap.get(s);if(a)return[a,!1];const c=L((r=this._wrap(s))!=null?r:s,{ctx:this.context,unmarshal:this._unmarshal,isMarshalable:this._isMarshalable,find:this._marshalFind,pre:this._marshalPre,preApply:this._marshalPreApply,custom:(o=this._options)==null?void 0:o.customMarshaller});return[c,!this._map.hasHandle(c)]}),p(this,"_preUnmarshal",(s,r)=>{var o;return(o=this._register(s,r,void 0,!0))==null?void 0:o[0]}),p(this,"_unmarshalFind",s=>{var r;return(r=this._registeredMap.getByHandle(s))!=null?r:this._map.getByHandle(s)}),p(this,"_unmarshal",s=>{var r;const o=this._registeredMap.getByHandle(s);if(typeof o<"u")return o;const[a]=this._wrapHandle(s);return Ne(a??s,{ctx:this.context,marshal:this._marshal,find:this._unmarshalFind,pre:this._preUnmarshal,custom:(r=this._options)==null?void 0:r.customUnmarshaller})}),p(this,"_syncMode",s=>{const r=this._unwrap(s);return this._sync.has(r)||this._temporalSync.has(r)?"both":void 0}),p(this,"_unwrapIfNotSynced",s=>{const r=this._unwrap(s);return r instanceof Promise||!this._sync.has(r)?r:s});var i;t!=null&&t.compat&&!("runtime"in e)&&(e.runtime={hasPendingJob:()=>e.hasPendingJob(),executePendingJobs:s=>e.executePendingJobs(s)}),this.context=t!=null&&t.experimentalContextEx?se(e):e,this._options=t,this._symbolHandle=e.unwrapResult(e.evalCode("Symbol()")),this._map=new A(e),this._registeredMap=new A(e),this.registerAll((i=t?.registeredObjects)!=null?i:ie)}dispose(){var e,t;this._map.dispose(),this._registeredMap.dispose(),this._symbolHandle.dispose(),(t=(e=this.context).disposeEx)==null||t.call(e)}evalCode(e){const t=this.context.evalCode(e);return this._unwrapResultAndUnmarshal(t)}executePendingJobs(e){const t=this.context.runtime.executePendingJobs(e);if("value"in t)return t.value;throw this._unwrapIfNotSynced(t.error.consume(this._unmarshal))}expose(e){for(const[t,i]of Object.entries(e))pe(this._marshal(i),s=>{this.context.setProp(this.context.global,t,s)})}sync(e){const t=this._wrap(e);return typeof t>"u"?e:(ge(t,i=>{const s=this._unwrap(i);this._sync.add(s)}),t)}register(e,t){if(this._registeredMap.has(e))return;const i=typeof t=="string"?this._unwrapResult(this.context.evalCode(t)):t;ae(this.context,i,this.context.undefined)||(typeof t=="string"&&this._registeredMapDispose.add(e),this._registeredMap.set(e,i))}registerAll(e){for(const[t,i]of e)this.register(t,i)}unregister(e,t){this._registeredMap.delete(e,this._registeredMapDispose.has(e)||t),this._registeredMapDispose.delete(e)}unregisterAll(e,t){for(const i of e)this.unregister(i,t)}startSync(e){if(!w(e))return;const t=this._unwrap(e);this._sync.add(t)}endSync(e){this._sync.delete(this._unwrap(e))}_unwrapResult(e){if("value"in e)return e.value;throw this._unwrapIfNotSynced(e.error.consume(this._unmarshal))}_unwrapResultAndUnmarshal(e){if(e)return this._unwrapIfNotSynced(this._unwrapResult(e).consume(this._unmarshal))}_register(e,t,i=this._map,s){if(this._registeredMap.has(e)||this._registeredMap.hasHandle(t))return;let r=this._wrap(e);const[o]=this._wrapHandle(t),a=e instanceof Promise;if(!o||!r&&!a)return;a&&(r=e);const c=this._unwrap(e),[u,d]=this._unwrapHandle(t);if(i.set(r,o,c,u))s&&this._sync.add(c);else throw d&&u.dispose(),new Error("already registered");return[r,o]}_wrap(e){var t;return Le(this.context,e,this._symbol,this._symbolHandle,this._marshal,this._syncMode,(t=this._options)==null?void 0:t.isWrappable)}_unwrap(e){return x(e,this._symbol)}_wrapHandle(e){var t;return He(this.context,e,this._symbol,this._symbolHandle,this._unmarshal,this._syncMode,(t=this._options)==null?void 0:t.isHandleWrappable)}_unwrapHandle(e){return M(this.context,e,this._symbolHandle)}}class b{static QuickJS;vm;arena;static async init(){b.QuickJS||(b.QuickJS=await ee(Z))}constructor(){if(!b.QuickJS)throw new Error("QuickJS not initialized");this.vm=b.QuickJS.newContext(),this.arena=new Te(this.vm,{isMarshalable:!0})}evalCode(e){try{const t=this.arena.evalCode(e);return k.right(t)}catch(t){return t instanceof Error?k.left(t):k.left(new Error(`Unknown error: ${t}`))}}dispose(){this.arena.dispose(),this.vm.dispose()}[Symbol.dispose](){this.vm.dispose()}}const S=n=>V(n),E=G("WorkerScript");await b.init();const I=new b,y=new X,Ie={defineDeviceClass:y.defineDeviceClass.bind(y),getDeviceClass:y.getDeviceClass.bind(y),getDevice:y.getDevice.bind(y),getDevicesByClass:y.getDevicesByClass.bind(y),updateDeviceState:y.updateDeviceState.bind(y),createDevice:y.createDevice.bind(y),linkDeviceType:y.linkDeviceType.bind(y)};y.on("deviceStateChange",n=>{S({type:"updateDeviceState",id:n.id,state:n.state})});I.arena.expose({console,game:Ie,Types:{...W,...Q}});z(n=>{try{const e=n;switch(e.type){case"start":E.debug("Received start message");break;case"pause":E.debug("Received pause message");break;case"reset":E.debug("Received reset message");break;case"runScript":E.debug("Received scriptExecution message");const t=I.evalCode(e.script);if(k.isLeft(t)){const s=new Error(t.left.message);t.left.cause&&(s.cause=t.left.cause),t.left.stack&&(s.stack=t.left.stack),t.left.name&&(s.name=t.left.name),t.left.message&&(s.message=t.left.message),Object.keys(t.left).length==0&&(s.message="Unknown error"),S({type:"error",error:s})}break;case"event":y.receiveEvent(e);break;case"addDevice":y.addDevice(e.definition.typeTag,e.id);break;case"dump":S({type:"dump",data:{devices:Array.from(y.getDevices()).map(s=>({id:s.id,state:s.state,deviceClass:s.deviceClass.name})),links:Object.fromEntries(y.getLinks().entries())}});break;case"load":const i=e.data;Object.entries(i.links).forEach(([s,r])=>{y.linkDeviceType(r,s)}),i.devices.forEach(s=>{y.createDevice(s.deviceClass,s.id,s.state)});break;default:throw new q(`Unknown message type: ${e.type}`)}}catch(e){E.error("Error processing message",e),S({type:"error",error:e})}});S({type:"ready"});E.info("Worker script started");
