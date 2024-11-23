console.log("load bride.js");
// document.body.style = "padding-right:400px";
(() => {
  function stringify(original) {
    return function (json) {
      if (json) {
        return JSON.stringify(this);
      }
      return original.call(this);
    };
  }
  Array.prototype.toString = stringify(Array.prototype.toString);
  Object.prototype.toString = stringify(Object.prototype.toString);
  String.prototype.toJson = function () {
    try {
      return JSON.parse(this);
    } catch (e) {
      return null;
    }
  };
})();
(() => {
  const elementEvents = {
    add(type, listener) {
      document.body.addEventListener(type, listener);
    },
    remove(type, listener) {
      document.body.removeEventListener(type, listener);
    },
  };
  const previewEvents = {
    text(event) {
      if (!previewEvents.common(event)) {
        return;
      }
      iframe.postMessage("onPreview", { value: event.target.innerText });
    },
    image(event) {
      if (!previewEvents.common(event)) {
        return;
      }
      iframe.postMessage("onPreview", { value: event.target.src });
    },
    background(event) {
      if (!previewEvents.common(event)) {
        return;
      }
      iframe.postMessage("onPreview", {
        value: matching.getElementBackground(event.target),
      });
    },
    contextmenu() {
      previewEvents.remove();
      // TODO
    },
    common(event) {
      if (!matching.previewElement) {
        previewEvents.remove();
        return false;
      }
      matching.previewElement.target = event.target;
      return true;
    },
    add(type) {
      if (typeof previewEvents[type] !== "function") {
        return;
      }
      elementEvents.remove();
      elementEvents.add("contextmenu", previewEvents.contextmenu);
      elementEvents.add("mouseover", previewEvents[type]);
    },
    remove() {
      elementEvents.remove("mouseover", previewEvents.text);
      elementEvents.remove("mouseover", previewEvents.image);
      elementEvents.remove("mouseover", previewEvents.background);
      elementEvents.remove("contextmenu", previewEvents.contextmenu);
    },
  };

  const matching = {
    elements: [],
    previewElement: null,
    closestIndex: 0,
    ancestors: [],
    getElements(filter = false) {
      const list = this.elements.map((v) => v.target);
      if (filter) {
        return list.filter((v) => !!v);
      }
      return list;
    },
    startPreview(index, option) {
      previewEvents.remove();
      const element = this.elements[index];
      if (!element) {
        return;
      }
      element.option = option;
      element.target = null;
      this.previewElement = { index, option };
      previewEvents.add(option.type);
    },
    cancelPreview() {
      previewEvents.remove();
      if (!this.previewElement) {
        return;
      }
      const { index, target } = this.previewElement;
      this.elements[index].target = target;
      this.previewElement = null;
      return { index, target };
    },
    toggleMatching() {
      const contents = this.getMatchingContent();
      if (!contents) {
        return;
      }
      iframe.postMessage("onSelection", { contents });
    },

    getMatchingContent() {
      const closestElement = this.ancestors[this.closestIndex];
      if (!closestElement) {
        return;
      }
      const matchingSiblings = this.getMatchingSiblings(
        closestElement,
        ...this.getElements()
      );
      return matchingSiblings.map((item) => {
        return this.elements.map((v, i) => {
          const obj = { type: v.option.type, content: "" };
          switch (v.option.type) {
            case "text":
              obj.content = item[i]?.innerText;
              return obj;
            case "image":
              obj.content = item[i]?.src;
              return obj;
            case "background":
              obj.content = this.getElementBackground(item[i]);
              return obj;
            default:
              break;
          }
        });
      });
    },

    getElementBackground(element) {
      if (!element) {
        return "";
      }
      const computedStyle = window.getComputedStyle(element);
      const backgroundImage =
        computedStyle.getPropertyValue("background-image");
      return backgroundImage.replace(/^url\((["'])(.+)\1.+/, "$2");
    },
    changeElementsAfter() {
      const commonClosest = this.getClosestCommonAncestor(
        ...this.getElements(true)
      );
      if (commonClosest) {
        this.ancestors = this.getAncestors(commonClosest);
        this.ancestors.unshift(commonClosest);
      } else {
        this.ancestors = [];
      }
      this.toggleClosestIndex();
      this.toggleMatching();
      iframe.postMessage("onSelected");
    },
    toggleClosestIndex() {
      const maxIndex = this.ancestors.length - 1;
      if (this.closestIndex > maxIndex) {
        this.closestIndex = maxIndex;
      }
      iframe.postMessage("onClosestIndex", {
        index: this.closestIndex,
        length: this.ancestors.length,
      });
    },
    getMatchingSiblings(commonElement, ...elements) {
      const parent = commonElement.parentElement;
      if (!parent) return [];
      const siblings = Array.from(parent.children);
      const elPaths = elements.map((el) =>
        this.getPathFromElement(el, commonElement)
      );
      return siblings.map((sibling) => {
        return elPaths.map((elPath) => {
          if (!elPath.length) {
            return null;
          }
          return this.getElementByPath(sibling, elPath);
        });
      });
    },

    getPathFromElement(element, root) {
      const path = [];
      let current = element;
      while (current && current !== root && current.parentElement) {
        const index = Array.from(current.parentElement.children).indexOf(
          current
        );
        path.unshift({ tagName: current.tagName, index });
        current = current.parentElement;
      }
      return path;
    },

    getElementByPath(root, path) {
      let current = root;
      for (const step of path) {
        const children = Array.from(current.children);
        current = children[step.index];
        if (
          !current ||
          current.tagName.toLowerCase() !== step.tagName.toLowerCase()
        ) {
          return null;
        }
      }
      return current;
    },

    /**
     * 获取多个元素公共的祖先
     * @param  {...any} elements
     * @returns {HTMLElement|null}
     */
    getClosestCommonAncestor(...elements) {
      const ancestors = elements.map((element) => this.getAncestors(element));
      if (!ancestors.length) {
        return null;
      }
      const commonAncestors = ancestors.reduce((common, current) => {
        return common.filter((ancestor) => current.includes(ancestor));
      });
      return commonAncestors[0];
    },
    /**
     * 获取元素的祖先
     * @param {*} element
     * @returns
     */
    getAncestors(element) {
      const ancestors = [];
      if (!element) {
        console.log("element is null");
        return;
      }
      let parent = element.parentElement;
      while (parent) {
        ancestors.push(parent);
        parent = parent.parentElement;
      }
      return ancestors;
    },
  };

  const progress = {
    calc(update = {}, current = null) {
      if (!current) {
        current = {
          total: 0,
          percent: 0,
          loaded: 0,
          lengthComputable: false,
          complete: false,
        };
      }
      current = {
        ...current,
        ...JSON.parse(JSON.stringify(update, Object.keys(current))),
      };
      current.lengthComputable = !!current.total;
      if (current.lengthComputable) {
        current.percent = (current.loaded / current.total) * 100;
        current.complete = current.percent >= 100;
      }
      return current;
    },
    paramsToKey(params) {
      return Object.keys(params)
        .map((k) => `${k}_${params[k]}`)
        .join("-");
    },
    common(type, key, update, params = {}) {
      const current = this[key];
      if (typeof update === "number") {
        if (!current) {
          throw new Error(`${key} 进度未初始化，不能直接更新loaded`);
        }
        update = {
          loaded: (current.loaded += update),
        };
      }
      this[key] = this.calc(update, current);
      const data = { ...{ progress: this[key], type }, ...params };
      iframe.postMessage("onSaveProgress", data);
      return data;
    },
    load(update, params = {}) {
      const type = "image-load-count";
      const data = this.common(type, type, update, params);
      this.all(params);
      return data;
    },
    zip(update, params = {}) {
      const type = "zip-count";
      const data = this.common(type, type, update, params);
      this.all(params);
      return data;
    },
    list(type, update, params = {}) {
      return this.common(type, type + this.paramsToKey(params), update, params);
    },
    all(params = {}) {
      const type = "all-progress";
      const keys = ["image-load-count", "zip-count"];
      if (!keys.every((k) => !!this[k])) {
        // console.log("未初始化完成");
        return;
      }
      const loaded = keys.reduce((prev, key) => {
        return prev + (100 / keys.length) * (this[key].percent / 100);
      }, 0);
      return this.common(type, type, { loaded, total: 100 }, params);
    },
  };

  const actions = {
    xhr: {
      select() {
        const result = matching.cancelPreview();
        if (!result) {
          return;
        }
        const { index, target } = result;
        matching.elements[index].target = target;
        matching.changeElementsAfter();
      },
      toggle({ index, option }) {
        if (index == -1 || !option) {
          return;
        }
        matching.startPreview(index, option);
      },
      push({ option }) {
        matching.elements.push({ target: null, option });
      },
      up() {
        const len = matching.ancestors.length;
        if (matching.closestIndex < len - 1) {
          matching.closestIndex++;
        }
        matching.toggleClosestIndex();
        matching.toggleMatching();
      },
      down() {
        if (matching.closestIndex > 0) {
          matching.closestIndex--;
        }
        matching.toggleClosestIndex();
        matching.toggleMatching();
      },
      delete() {
        matching.cancelPreview();
        matching.elements.splice(this.data.params.index, 1);
        matching.changeElementsAfter();
      },
    },
  };
  function fetchImageWithProgress(url, callback) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.responseType = "blob";
      xhr.onprogress = (event) => {
        if (typeof callback === "function") {
          let progress;
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            progress = {
              total: event.total,
              loaded: event.loaded,
              percent: percentComplete,
            };
          }
          callback.call(event, progress);
        }
      };
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(xhr.response);
        } else {
          reject(new Error(`Failed to fetch image: ${xhr.status}`));
        }
      };
      xhr.onerror = () => {
        reject(new Error(`Failed to fetch image`));
      };
      xhr.send();
    });
  }

  function filterImages(list) {
    const arr = [];
    list.forEach((v) => {
      if (v.constructor === Array) {
        arr.push(...this.filterImages(v));
        return;
      }
      const checks = [
        (v.type === "image" || v.type === "background") && v.content,
        v.url,
      ];
      if (checks.some((v) => v)) {
        arr.push(v);
      }
    });
    return arr;
  }
  const common = {
    xhr: {
      async save(list) {
        const images = filterImages(list);
        if (!images.length) {
          return;
        }
        if (!JSZip) {
          const JSZip = require("jszip");
        }
        console.log(JSZip.version);
        const zipName = "collection_" + +new Date();
        const zip = new JSZip();
        const mainFolder = zip.folder(zipName);
        mainFolder.file("contents.json", JSON.stringify(list, null, 2));
        const imagesFolder = mainFolder.folder("images");
        imagesCount = images.length;
        progress.load({ total: imagesCount });
        progress.zip({ total: 100 });
        await new Promise((resolve) => {
          images.forEach((item) => {
            let url = item.content || item.url;
            if (!url) {
              return;
            }
            progress.list("image-load", {}, item);
            fetchImageWithProgress(url, function () {
              progress.list("image-load", this, item);
            }).then((blob) => {
              progress.list("image-load", { complete: true }, item);
              imagesFolder.file(item.filename, blob);
              if (progress.load(1).progress.complete) {
                resolve(true);
              }
            });
          });
        });
        const content = await zip.generateAsync(
          { type: "blob" },
          ({ percent, currentFile }) => {
            progress.zip({ loaded: percent }, { currentFile });
          }
        );
        saveAs(content, `${zipName}.zip`);
      },
    },
  };
  const keydown = {
    __listeners: [],
    xhr: {
      sync(keysCombination) {
        const item = {
          combination: keysCombination.toString(true),
          listener(event) {
            const key = event.key.toLowerCase();
            const combination = item.combination.toJson();
            for (const eKey in combination) {
              if (eKey && !event[eKey]) {
                continue;
              }

              for (const action in combination[eKey]) {
                if (combination[eKey][action].includes(key)) {
                  event.preventDefault();
                  iframe.postMessage("syncKeydown", { action, key });
                }
              }
            }
          },
        };
        keydown.__listeners.push(item);
        window.addEventListener("keydown", item.listener);
      },
      destroy(combination) {
        const combinationString = combination.toString(true);
        const item = keydown.__listeners.find((item) => {
          return item.combination === combinationString;
        });
        const index = keydown.__listeners.indexOf(item);
        if (index !== -1) {
          keydown.__listeners.splice(index, 1);
          window.removeEventListener("keydown", item.listener);
        }
      },
    },
  };

  const iframe = {
    actions,
    keydown,
    common,
    event: null,
    postMessage(action, params, options = "*") {
      iframe.event.source.postMessage({ action, params }, options);
    },
    listener(event) {
      const { type, action, sync_id, params } = event.data;
      if (type === "init") {
        iframe.event = event;
        return;
      }
      if (typeof iframe[type]?.xhr?.[action] !== "function") {
        console.error(event.data);
        throw new Error(`${type} - ${action} 不是一个有效的方法`);
      }
      iframe.event = event;
      const result = iframe[type].xhr[action].call(iframe, params);
      if (!sync_id) {
        return;
      }
      if (!(result instanceof Promise)) {
        iframe.postMessage({ sync_id, result });
        return;
      }
      (async () => {
        iframe.postMessage({ sync_id, result: await result });
      })();
    },
  };

  window.addEventListener("message", iframe.listener);
})();
