import { isEmpty } from "./isEmpty";

export const capitalize = (s: string) => {
	return s.charAt(0).toUpperCase() + s.slice(1);
};

export const firstLetterCase = (value: string) => {
	if (!isEmpty(value)) {
		return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
	}
	return "";
};

export const upperCase = (s: string) => {
	if (isEmpty(s)) {
		return "";
	}
	return s.toUpperCase();
};

export const lowerCase = (s: string) => {
	if (isEmpty(s)) {
		return "";
	}
	return s.toLowerCase();
};
export const queryString = (s: any) => {
	let n: any = new URLSearchParams(s);
	return "?".concat(n);
};
