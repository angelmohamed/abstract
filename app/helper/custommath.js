import {convert} from "./convert"


export function shortText(address) {
    try {
        var addr = address.substring(0, 4);
        var addr1 = address.substring(38, 44);
        var concat = addr + "...." + addr1;
        return concat;
    } catch (err) {
        return "";
    }
}

export function numberFloatOnly(value) {
    //eslint-disable-next-line
    const regxFormat = /^[]?\d*(?:[.]\d*)?$/;
    var result = regxFormat.test(value)
    return result;
  }

export async function getFormatMulticall(results, name, pos) {

    try {
      var returnVal = (results && results.results && results.results[name]
        && results.results[name].callsReturnContext &&
        results.results[name].callsReturnContext &&
        results.results[name].callsReturnContext[pos] &&
        results.results[name].callsReturnContext[pos].returnValues &&
        results.results[name].callsReturnContext[pos].returnValues[0]) ?
        results.results[name].callsReturnContext[pos].returnValues[0] : "";
      return returnVal;
    } catch (err) {
      return "";
    }
  }


  export async function getFormatMulticall1(results, name, pos) {

    try {
      var returnVal = (results && results.results && results.results[name]
        && results.results[name].callsReturnContext &&
        results.results[name].callsReturnContext &&
        results.results[name].callsReturnContext[pos] &&
        results.results[name].callsReturnContext[pos].returnValues &&
        results.results[name].callsReturnContext[pos]) ?
        results.results[name].callsReturnContext[pos].returnValues : "";
      return returnVal;
    } catch (err) {
      return "";
    }
  }


export function toFixedWithoutRound(number, decimalPlaces = 2) {
  try {
      let numberString = number.toString();
      let decimalIndex = numberString.indexOf('.');
      if (decimalIndex === -1) {
          return number;
      }
      numberString = numberString.slice(0, decimalIndex + decimalPlaces + 1);
      let truncatedNumber = parseFloat(numberString);
      return truncatedNumber;
  } catch (err) {
      return 0;
  }

}

  export function formatNumber(num, defaultFixed) {

    try {
      if (defaultFixed && parseInt(defaultFixed) > 0) {
        defaultFixed = parseInt(defaultFixed);
      } else {
        defaultFixed = 5;
      }
      var numval = num.toString();
      numval = convert(numval);
  
      var chkDeci = numval.split(".");
      var returnNum = num;
      if (chkDeci.length == 2) {
        if (defaultFixed < chkDeci[1].length) {
          returnNum = toFixedWithoutRound(numval, defaultFixed);
        } else {
          var fix = chkDeci[1].length;
          returnNum = toFixedWithoutRound(numval, fix);
        }
      }
  
      return returnNum;
    } catch (err) {
      return 0;
    }
  
  }

  export function shortValue(address) {
    try {
        var addr = address.substring(0, 6);
        var addr1 = address.substring(34, 42);
        var concat = addr + "...." + addr1;
        return concat;
    } catch (err) {
        return "";
    }
}