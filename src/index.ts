interface Map {
  [key: string]: string | number | undefined;
}

// 下划线转换驼峰
function toHump(name: string = ""): string {
  return name.replace(/\-(\w)/g, function (all, letter) {
    return letter.toUpperCase();
  });
}

// 驼峰转换下划线
function toLine(name: string = ""): string {
  return name.replace(/([A-Z])/g, "-$1").toLowerCase();
}

function processImg(url: string, params: Map): string {
  const urlRegex =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
  const processQueryRegex = /x-oss-process=image\/(.+)(?:&|$)/;
  let result = "";
  if (!url || typeof url !== "string" || !urlRegex.test(url)) {
    throw new Error("URL不合法");
  }
  let paramStr = "";
  Object.keys(params).forEach((key, index) => {
    paramStr = `${paramStr}/${toLine(key)},${params[key]}`;
  });
  if (url.indexOf("?") === -1) {
    // 无参数图片 直接拼图片
    result = `${url}?x-oss-process=image${paramStr}`;
  } else {
    if (url.indexOf("x-oss-process") === -1) {
      // 有参数，无图片处理
      result = `${url}&x-oss-process=image${paramStr}`;
    } else {
      // 有参数，有图片处理
      const queryString = url.split("x-oss-process=image")[1];
      if (queryString) {
        const queryList = queryString.split("/");
        queryList.shift();
        let queryObject: Map = {}; // 自带参数转成的对象
        queryList.forEach((item, i) => {
          const key = item.split(",")[0];
          const value = item.split(key)[1].slice(1);
          queryObject[toHump(key)] = value;
        });
        // 将配置参数并合到自带参数中
        const resultQueryObject = Object.assign(queryObject, params);
        let resultQueryStr = ""; // 生成最终的参数字符串
        Object.keys(resultQueryObject).forEach((key) => {
          resultQueryStr = `${resultQueryStr}/${toLine(key)},${
            resultQueryObject[key]
          }`;
        });
        const urlRegList = url.match(processQueryRegex) || [];
        let processQuery = urlRegList[1];
        // 移除参数第一个字符"/"
        resultQueryStr = resultQueryStr.substring(1);
        result = url.replace(processQuery, `${resultQueryStr}`);
      }
    }
  }
  return result;
}

class MyProcess {
  private url: string;
  constructor(url = "") {
    this.url = url;
  }

  init(val: string) {
    this.url = val;
    return this;
  }

  setWidth(val: string) {
    this.url = processImg(this.url, { resize: `w_${val}` });
    return this;
  }

  setHeight(val: string) {
    this.url = processImg(this.url, { resize: `h_${val}` });
    return this;
  }

  setQuality(val: string) {
    this.url = processImg(this.url, { quality: `q_${val}` });
    return this;
  }

  get value() {
    return this.url;
  }
}

export default MyProcess;
