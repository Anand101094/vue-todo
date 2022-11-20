export function isObject(val) {
  if (val === null) {
    return false;
  }
  if (!Array.isArray(val) && typeof val === "object") {
    return true;
  }
}

export function isArray(val) {
  return Array.isArray(val);
}

export function cloneDeep(data) {
  let result;
  const isValidObject = isObject(data);
  const isValidArray = isArray(data);
  if (!isValidObject && !isValidArray) {
    return data;
  }

  if (isValidObject) {
    result = {};
    Object.entries(data).forEach(([key, val]) => {
      result[key] = cloneDeep(val);
    });
  }

  if (isValidArray) {
    result = [];
    data.forEach((item) => {
      result.push(cloneDeep(item));
    });
  }

  return result;
}

export function generateUID() {
  return Math.floor(Math.random() * Date.now());
}
