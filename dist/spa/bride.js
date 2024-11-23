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
  const drag = document.getElementById("collection-iframe-drag");
})();
(() => {
  const events = {
    preText(event) {
      if (!events.commonPreviewListener(event)) {
        return;
      }
      actions.postMessage("onPreview", { value: event.target.innerText });
    },
    preImage(event) {
      if (!events.commonPreviewListener(event)) {
        return;
      }
      actions.postMessage("onPreview", { value: event.target.src });
    },
    preBackground(event) {
      if (!events.commonPreviewListener(event)) {
        return;
      }
      actions.postMessage("onPreview", {
        value: actions.getElementBackground(event.target),
      });
    },
    contextmenu() {
      events.removePreviewListener();
    },
    commonPreviewListener(event) {
      if (!actions.previewElement) {
        events.removePreviewListener();
        return false;
      }
      actions.previewElement.target = event.target;
      return true;
    },
    addPreviewListener(type) {
      events.removePreviewListener();
      document.body.addEventListener("contextmenu", events.contextmenu);
      switch (type) {
        case "text":
          document.body.addEventListener("mouseover", events.preText);
          break;
        case "image":
          document.body.addEventListener("mouseover", events.preImage);
          break;
        case "background":
          document.body.addEventListener("mouseover", events.preBackground);
          break;
        default:
          break;
      }
    },
    removePreviewListener() {
      document.body.removeEventListener("mouseover", events.preText);
      document.body.removeEventListener("mouseover", events.preImage);
      document.body.removeEventListener("mouseover", events.preBackground);
      document.body.removeEventListener("contextmenu", events.contextmenu);
    },
  };

  const actions = {
    iframe: null,
    elements: [],
    previewElement: null,
    parentElement: null,
    closestIndex: 0,
    ancestors: [],
    xhr: {
      init() {
        actions.iframe = this;
      },
      select() {
        const result = actions.cancelPreview();
        if (!result) {
          return;
        }
        const { index, target } = result;
        actions.elements[index].target = target;
        actions.changeElementsAfter();
      },
      toggle() {
        const params = this.data.params;
        if (params.index == -1 || !params.option) {
          return;
        }
        actions.startPreview(params.index, params.option);
      },
      push() {
        actions.elements.push({
          target: null,
          option: this.data.params.option,
        });
      },
      up() {
        const len = actions.ancestors.length;
        if (actions.closestIndex < len - 1) {
          actions.closestIndex++;
        }
        actions.toggleClosestIndex();
        actions.toggleMatching();
      },
      down() {
        if (actions.closestIndex > 0) {
          actions.closestIndex--;
        }
        actions.toggleClosestIndex();
        actions.toggleMatching();
      },
      delete() {
        actions.cancelPreview();
        actions.elements.splice(this.data.params.index, 1);
        actions.changeElementsAfter();
      },
      async save() {
        const contents = this.data.params.contents;
        if (!contents || !contents.length) {
          return;
        }
        if (!JSZip) {
          const JSZip = require("jszip");
        }
        console.log(JSZip.version);
        const zipName = "collection_" + +new Date();
        const zip = new JSZip();
        const mainFolder = zip.folder(zipName);
        mainFolder.file("contents.json", JSON.stringify(contents, null, 2));
        const imagesFolder = mainFolder.folder("images");
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
            actions.postMessage("onSaveProgress", data);
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
            return this.common(
              type,
              type + this.paramsToKey(params),
              update,
              params
            );
          },
          all(params = {}) {
            const type = "all-progress";
            const keys = ["image-load-count", "zip-count"];
            if (!keys.every((k) => !!this[k])) {
              console.log("未初始化完成");
              return;
            }
            const loaded = keys.reduce((prev, key) => {
              return prev + (100 / keys.length) * (this[key].percent / 100);
            }, 0);
            return this.common(type, type, { loaded, total: 100 }, params);
          },
        };
        const imagesCount = contents.reduce((pg, cg) => {
          return (
            cg.reduce((pi, ci) => {
              if (ci.type === "image" || ci.type === "background") {
                return pi + 1;
              }
              return pi;
            }, 0) + pg
          );
        }, 0);
        progress.load({ total: imagesCount });
        progress.zip({ total: 100 });
        await new Promise((resolve) => {
          contents.forEach((group, gid) => {
            group.forEach((item, lid) => {
              if (item.type === "image" || item.type === "background") {
                progress.list("image-load", {}, { gid, lid });
                fetchImageWithProgress(item.content, function () {
                  progress.list("image-load", this, { gid, lid });
                }).then((blob) => {
                  progress.list("image-load", { complete: true }, { gid, lid });
                  imagesFolder.file(item.filename, blob);
                  if (progress.load(1).progress.complete) {
                    resolve(true);
                  }
                });
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
    startPreview(index, option) {
      events.removePreviewListener();
      const element = actions.elements[index];
      if (!element) {
        return;
      }
      element.option = option;
      element.target = null;
      actions.previewElement = { index, option };
      events.addPreviewListener(option.type);
    },
    cancelPreview() {
      events.removePreviewListener();
      if (!actions.previewElement) {
        return;
      }
      const { index, target } = actions.previewElement;
      actions.elements[index].target = target;
      actions.previewElement = null;
      return { index, target };
    },
    changeElementsAfter() {
      const commonClosest = actions.getClosestCommonAncestor(
        ...actions.getElements(true)
      );
      if (commonClosest) {
        actions.ancestors = actions.getAncestors(commonClosest);
        actions.ancestors.unshift(commonClosest);
      } else {
        actions.ancestors = [];
      }
      actions.toggleClosestIndex();
      actions.toggleMatching();
      actions.postMessage("onSelected");
    },
    toggleClosestIndex() {
      const maxIndex = actions.ancestors.length - 1;
      if (actions.closestIndex > maxIndex) {
        actions.closestIndex = maxIndex;
      }
      actions.postMessage("onClosestIndex", {
        index: actions.closestIndex,
        length: actions.ancestors.length,
      });
    },
    fileinfo(path) {
      const match = path.match(/\/([^/?]+)(\?|$)/);
      const filename = match ? match[1] : "";
      const ext = filename.split(".").pop();
      return { filename, ext };
    },

    downloadImage(url, filename) {
      if (!filename) {
        filename = actions.fileinfo(url).filename;
      }
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      return new Promise((resolve) => {
        setTimeout(() => {
          a.click();
          document.body.removeChild(a);
          resolve(true);
        }, 100);
      });
    },
    postMessage(action, params) {
      actions.iframe.source.postMessage({ action, params }, "*");
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

    getElements(filter = false) {
      const list = actions.elements.map((v) => v.target);
      if (filter) {
        return list.filter((v) => !!v);
      }
      return list;
    },
    getMatchingContent() {
      const closestElement = actions.ancestors[actions.closestIndex];
      if (!closestElement) {
        return;
      }
      const matchingSiblings = actions.getMatchingSiblings(
        closestElement,
        ...actions.getElements()
      );
      return matchingSiblings.map((item) => {
        return actions.elements.map((v, i) => {
          const obj = { type: v.option.type, content: "" };
          switch (v.option.type) {
            case "text":
              obj.content = item[i]?.innerText;
              return obj;
            case "image":
              obj.content = item[i]?.src;
              return obj;
            case "background":
              obj.content = actions.getElementBackground(item[i]);
              return obj;
            default:
              break;
          }
        });
      });
    },
    toggleMatching() {
      const contents = actions.getMatchingContent();
      if (!contents) {
        return;
      }
      actions.postMessage("onSelection", { contents });
    },

    getMatchingSiblings(commonElement, ...elements) {
      const parent = commonElement.parentElement;
      if (!parent) return [];
      const siblings = Array.from(parent.children);
      const elPaths = elements.map((el) =>
        actions.getPathFromElement(el, commonElement)
      );
      return siblings.map((sibling) => {
        return elPaths.map((elPath) => {
          if (!elPath.length) {
            return null;
          }
          return actions.getElementByPath(sibling, elPath);
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
      const ancestors = elements.map((element) =>
        actions.getAncestors(element)
      );
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
    fetchImage(url) {
      return new Promise(async (resolve) => {
        const response = await fetch(url);
        if (!response.ok) {
          console.log(`Failed to fetch image: ${url}`);
          resolve(null);
          return;
        }
        const blob = await response.blob();
        resolve(blob);
      });
    },
    listener(event) {
      const { action, sync_id } = event.data;
      if (typeof actions.xhr[action] !== "function") {
        return;
      }
      const result = actions.xhr[action].call(event);
      if (sync_id) {
        if (result instanceof Promise) {
          (async () => {
            actions.iframe.source.postMessage(
              { sync_id, result: await result },
              "*"
            );
          })();
          return;
        }
        actions.iframe.source.postMessage({ sync_id, result }, "*");
      }
    },
  };

  const keys = {
    up: ["pageup", "arrowup"],
    down: ["pagedown", "arrowdown"],
    save: ["s"],
    push: ["+"],
    switch: ["t", "g", "b"],
    delete: ["delete"],
    select: ["enter"],
    toggle: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    escape: ["escape"],
  };
  const keydown = {
    combination: {
      ctrlKey: keys,
      metaKey: keys,
      shiftKey: { up: keys.up, down: keys.down },
      "": { escape: keys.escape },
    },
    listener(event) {
      for (const key in keydown.combination) {
        if ((key && !event[key]) || !event.key) {
          continue;
        }
        for (const action in keydown.combination[key]) {
          if (
            keydown.combination[key][action].includes(event.key.toLowerCase())
          ) {
            event.preventDefault();
            actions.postMessage("onForwarding", {
              action,
              key: event.key.toLowerCase(),
            });
          }
        }
      }
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

  const iframe = {
    event: null,
    postMessage(message, options = "*") {
      iframe.event.source.postMessage(message, options);
    },
    listener(event) {
      const { type, action, sync_id, params } = event.data;
      console.log(type, action, sync_id, params);

      if (type === "init") {
        iframe.event = event;
      }
      if (typeof iframe[type]?.[action] !== "function") {
        return;
      }
      iframe.event = event;
      const result = iframe[type][action].apply(iframe, params);
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

  window.addEventListener("keydown", keydown.listener);
  window.addEventListener("message", actions.listener);
})();
