import isEmpty from "./isEmpty";
import moment from "moment";

export const momentFormat = (dateTime, format = "YYYY-MM-DD HH:mm") => {
  try {
    if (!isEmpty(dateTime)) {
      let newDateTime = new Date(dateTime);
      return moment(newDateTime).format(format);
    }
    return "";
  } catch (err) {
    return "";
  }
};