import isEmpty from "./isEmpty";

export const toFixedDown = (item, type = 2) => {
  try {
      if (!isEmpty(item) && !isNaN(item)) {
          item = parseFloat(item);
          //let decReg = new RegExp("(\\d+\\.\\d{" + type + "})(\\d)"),
          let decReg = new RegExp("(-?\\d+\\.\\d{" + type + "})(\\d)"),
              m = item.toString().match(decReg);
          return m ? parseFloat(m[1]) : item.valueOf();
      }
      return "";
  } catch (err) {
      return "";
  }
};
