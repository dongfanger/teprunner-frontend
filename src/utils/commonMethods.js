import { Notification, MessageBox } from "element-ui";

export function isType(type) {
  return function(obj) {
    return Object.prototype.toString.call(obj) === `[object ${type}]`;
  };
}

export function isJson(data) {
  return (
    typeof data == "object" && Object.prototype.toString.call(data).toLowerCase() === "[object object]" && !data.length
  );
}

export function filterNullValue(data) {
  if (isType("Object")(data)) {
    let resultObj = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value) {
        resultObj[key] = value;
      }
    });
    return resultObj;
  } else if (isType("Array")(data)) {
    return data.filter(value => value);
  }
}

export function onResponse({ status, statusText, data }, callback) {
  if ([200, 201, 204].includes(status)) {
    callback(data);
  } else {
    Notification({
      title: "提示",
      type: "error",
      message: `${status} ${statusText}`,
    });
  }
}

export function delConfirm(message, confirmCallback, options = {}) {
  const config = Object.assign(
    {},
    {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      confirmButtonClass: "el-button--danger",
      type: "warning",
    },
    options,
  );

  if (isType("Function")(confirmCallback)) {
    MessageBox.confirm(message, "提示", config)
      .then(confirmCallback)
      .catch(() => {});
  } else {
    MessageBox.confirm(message, "提示", config).catch(() => {});
  }
}

export function notifyMessage(message, options = {}) {
  Notification({
    title: "提示",
    type: "error",
    message,
    ...options,
  });
}

export function resultColor(res) {
  if (res.indexOf("error") !== -1) {
    return "red";
  } else if (res.indexOf("failed") !== -1) {
    return "rgb(236,76,71)";
  } else if (res.indexOf("passed") !== -1) {
    return "rgb(0,153,117)";
  }
}

export function isProjectExisted() {
  let projectEnvList = JSON.parse(localStorage.getItem("projectEnvList"));
  return !!projectEnvList;
}
