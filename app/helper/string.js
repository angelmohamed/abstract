export const capitalize = value => {
  if (typeof value !== "string") return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
  return "";
};

export const truncateString = (str, maxLength) => {
  if (str.length > maxLength) {
    return str.substring(0, maxLength) + "...";
  } 
  return str;
}
