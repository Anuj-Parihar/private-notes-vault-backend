import app from "../app.js";
console.log("router keys:", Object.keys(app._router || {}));
console.log("router stack length:", app._router?.stack?.length || 0);
console.dir(app._router?.stack?.slice(0, 10), { depth: 2 });
