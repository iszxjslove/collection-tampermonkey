export function postMessage(type, action, params, other = {}, options = "*") {
  parent.window.postMessage({ type, action, params, ...other }, options);
}

export function actionPost(action, params, other = {}) {
  postMessage("actions", action, params, other);
}
export function keydownPost(action, params, other = {}) {
  postMessage("keydown", action, params, other);
}
export function commonPost(action, params, other = {}) {
  postMessage("common", action, params, other);
}

export const padWithZero = (num, size) => `${num}`.padStart(size, "0");

export function generateFilename(src, pad, template) {
  if (!src) {
    return "";
  }
  const match = src.match(/\/([^/?]+)(\?|$)/);
  const filename = match ? match[1] : "";
  if (!template) {
    return filename;
  }
  const ext = filename.split(".").pop();
  if (template.indexOf("{index}") !== -1) {
    return template.replace("{index}", pad) + "." + ext;
  }
  return template + `_${pad}.${ext}`;
}

let requestSyncId = 0;
export function request(action, params, timeout = 10000) {
  if (requestSyncId > 100000) {
    requestSyncId = 0;
  }
  requestSyncId++;
  return new Promise((resolve) => {
    const sync_id = requestSyncId;
    const timer = setTimeout(() => {
      window.removeEventListener("message", callback);
    }, timeout);
    function callback(event) {
      if (event.data.sync_id === sync_id) {
        clearTimeout(timer);
        window.removeEventListener("message", callback);
        resolve(event.data);
      }
    }
    postMessage(action, params, { sync_id });
    window.addEventListener("message", callback);
  });
}

export function useHotKey(options = {}) {
  const xhr = {
    __callback: undefined,
    on(event, callback) {
      if (typeof callback !== "function") {
        throw new Error("不是一个有效的回调方法");
      }
      if (!xhr.__callback) {
        xhr.__callback = {};
      }
      xhr.__callback[event] = callback;
    },
    setCallbacks(callbacks) {
      for (const action in callbacks) {
        xhr.on(action, callbacks[action]);
      }
    },
    destroy: () => {
      xhr.__callback = {};
      window.removeEventListener("keydown", eventListener);
      if (options.sync) {
        window._keydownListenerAdded--;
        if (!window._keydownListenerAdded) {
          window.removeEventListener("message", syncKeydownListener);
        }
        keydownPost("destroy", options.combination);
      }
    },
  };
  if (options.callbacks) {
    xhr.setCallbacks(options.callbacks);
  }

  function eventAction(action, key) {
    if (typeof xhr.__callback[action] === "function") {
      this.preventDefault();
      let params = [key];

      if (typeof options.parser?.[action] === "function") {
        params = options.parser[action].apply(this, params);
      }
      xhr.__callback[action].apply(this, params);
    }
  }
  function eventListener(event) {
    const key = event.key.toLowerCase();
    const combination = options.combination;
    for (const eKey in combination) {
      if (eKey && !event[eKey]) {
        continue;
      }
      for (const action in combination[eKey]) {
        if (combination[eKey][action].includes(key)) {
          eventAction.call(event, action, key);
        }
      }
    }
  }
  function syncKeydownListener({ action, key }) {
    eventAction.call(this, action, key);
  }

  window.addEventListener("keydown", eventListener);
  if (options.sync) {
    useMessage({
      callbacks: { syncKeydown: syncKeydownListener },
    });
    keydownPost("sync", options.combination);
    window._keydownListenerAdded++;
  }
  return xhr;
}

export function useMessage(options = {}) {
  const xhr = {
    __callback: {},
    on(event, callback) {
      if (typeof callback !== "function") {
        throw new Error("不是一个有效的回调方法");
      }
      xhr.__callback[event] = callback;
    },
    setCallbacks(callbacks) {
      for (const action in callbacks) {
        xhr.on(action, callbacks[action]);
      }
    },
    destroy: () => {
      window.removeEventListener("message", eventListener);
    },
  };
  if (options.callbacks) {
    xhr.setCallbacks(options.callbacks);
  }

  function eventListener(event) {
    const { action, params } = event.data;
    if (typeof xhr.__callback[action] === "function") {
      event.preventDefault();
      let data = [params];
      if (typeof options.parser?.[action] === "function") {
        data = options.parser[action].apply(event, data);
      }
      xhr.__callback[action].apply(event, data);
    }
  }
  if (!window._addListener) {
    window.addEventListener("message", eventListener);
  }
  return xhr;
}
