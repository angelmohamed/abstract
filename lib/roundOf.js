import { isEmpty } from "./isEmpty";

Number.prototype.toFixedNoRounding = function (n) {
	if (n > 100) {
		throw new RangeError("The number of decimal places requested exceeds the limit of 100.");
	}
	let numStr = this.toString();
	const reg = new RegExp("^-?\\d+(?:\\.\\d{0," + n + "})?", "g");
	if (numStr.includes("e")) {
		numStr = this.toFixed(Math.min(n + 1, 100)); // Limit precision to avoid the error
	}
	const a = numStr.match(reg)[0];
	const dot = a.indexOf(".");
	if (dot === -1) {
		return a + "." + "0".repeat(n);
	}
	const b = n - (a.length - dot) + 1;
	return b > 0 ? a + "0".repeat(b) : a;
};

export const countDecimals = function (value) {
	if (Math.floor(value) === value) return 0;
	return value.toString().split(".")[1].length || 0;
};

export const toFixed = (item, type = 2) => {
	try {
		if (!isEmpty(item) && !isNaN(item)) {
			item = parseFloat(item);
			return item.toFixed(type);
		}
		return "";
	} catch (err) {
		return "";
	}
};

export const priceFixed = (item) => {
	try {
		if (!isEmpty(item) && !isNaN(item)) {
			if (item >= 50) return toFixed(item, 2);
			if (item > 1 && item < 50) return toFixed(item, 3);
			if (item < 1 && item >= 0.1) return longNumbers(item, 4);
			if (item < 0.1 && item >= 0.01) return longNumbers(item, 5);
			if (item < 0.01 && item >= 0.001) return longNumbers(item, 6);
			if (item < 0.001) return longNumbers(item, 7);
		}
	} catch (err) {
		console.log(err);
	}
};

export const currencyFormat = (item) => {
	try {
		if (!isEmpty(item) && !isNaN(item)) {
			item = item.toString();
			let splitValue = item.split(".");
			return splitValue[1]
				? `${splitValue[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${splitValue[1]}`
				: splitValue[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}
		return "";
	} catch (err) {
		return "";
	}
};

export const randomstring = (x) => {
	try {
		var result = "";
		var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		var charactersLength = characters.length;
		for (var i = 0; i < charactersLength; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	} catch (err) {
		return "";
	}
};

export const longNumbers = (x, n) => {
	try {
		x = parseFloat(x);
		if (!isNaN(x)) {
			if (x < 0) {
				x = x.toFixedNoRounding(n);
			} else if (x > 50) {
				if (n < 2) {
					x = x.toFixedNoRounding(n);
				} else {
					x = x.toFixedNoRounding(2);
				}
			} else {
				if (x < 0.000001) {
					const significantDigits = x.toExponential(n - 1);
					x = parseFloat(significantDigits).toFixedNoRounding(n);
				} else {
					x = x.toFixedNoRounding(n);
				}
			}
			// Add commas to the number
			const parts = x.toString().split(".");
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			return parts.join(".");
		}
		return "";
	} catch (err) {
		console.log(err, "err");
		return "";
	}
};

export const numberWithCommas = (x) => {
	try {
		const parts = x.toString().split(".");
		parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		return parts.join(".");
	} catch (err) {
		return "";
	}
};

export const approxDecimal = (x) => {
	try {
		let result;

		if (x < 1) {
			if (x < 0.0001) {
				if (x < 0.000001) {
					result = 0.0;
				} else {
					result = x.toFixedNoRounding(5);
				}
			} else {
				result = x.toFixedNoRounding(4);
			}
		} else {
			if (x < 10) {
				result = x.toFixedNoRounding(3);
			} else {
				result = x.toFixedNoRounding(2);
			}
		}

		// Add commas to the number
		if (result !== 0.0) {
			const parts = result.toString().split(".");
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
			return parts.join(".");
		} else {
			return "0.0";
		}
	} catch (err) {
		return "0";
	}
};

export const toFixedDown = (item, type = 2) => {
	try {
		if (!isEmpty(item) && !isNaN(item)) {
			// item = parseFloat(item);
			item = convert(item);
			let decReg = new RegExp("(\\d+\\.\\d{" + type + "})(\\d)"),
				m = item.toString().match(decReg);
			return m ? parseFloat(m[1]) : item.valueOf();
		}
		return "";
	} catch (err) {
		console.log(err);
		return "";
	}
};

export const convert = (n) => {
	try {
		var sign = +n < 0 ? "-" : "",
			toStr = n.toString();
		if (!/e/i.test(toStr)) {
			return n;
		}
		var [lead, decimal, pow] = n
			.toString()
			.replace(/^-/, "")
			.replace(/^([0-9]+)(e.*)/, "$1.$2")
			.split(/e|\./);
		return +pow < 0
			? sign + "0." + "0".repeat(Math.max(Math.abs(pow) - 1 || 0, 0)) + lead + decimal
			: sign +
					lead +
					(+pow >= decimal.length
						? decimal + "0".repeat(Math.max(+pow - decimal.length || 0, 0))
						: decimal.slice(0, +pow) + "." + decimal.slice(+pow));
	} catch (err) {
		return 0;
	}
};

export const avoidExponents = (x) => {
	try {
		if (x < 0.000001) {
			return 0;
		}
		return x;
	} catch (err) {
		return 0;
	}
};

export const precentConvetPrice = (price, percentage) => {
	price = parseFloat(price);
	percentage = parseFloat(percentage);

	if (!isEmpty(price)) {
		return price * (percentage / 100);
	}
	return 0;
};

Number.prototype.toFixedNoRoundingNoDecimals = function (n) {
	const reg = new RegExp("^-?\\d+(?:d{0," + n + "})?", "g");
	return this.toString().match(reg)[0];
};

export const longNumbersNoDecimals = (x, n) => {
	try {
		if (typeof x === "string") {
			x = parseFloat(x);
		}
		if (!isEmpty(x) && !isNaN(x)) {
			if (x < 0) {
				x = x.toFixedNoRoundingNoDecimals(n);
				return numberWithCommas(x);
			}
			if (x < 0.000001) {
				return 0.0;
			} else if (x > 100) {
				if (n < 2) {
					x = x.toFixedNoRoundingNoDecimals(n);
					return numberWithCommas(x);
				}
				x = x.toFixedNoRoundingNoDecimals(2);
				return numberWithCommas(x);
			}
			return numberWithCommas(x.toFixedNoRoundingNoDecimals(n));
		}
		return "";
	} catch (err) {
		console.log(err, "err");
		return "";
	}
};

export const shortenNumber = (input) => {
	let num;
	if (input !== 0 && input < 1000) {
		return input;
	}
	// If the input is a string, remove commas and convert to a number
	if (typeof input === "string") {
		num = parseFloat(input.replace(/,/g, ""));
	} else {
		// If it's already a number, just use it
		num = input;
	}
	if (num >= 1e9) {
		return (num / 1e9).toFixed(1) + "B";
	} else if (num >= 1e6) {
		return (num / 1e6).toFixed(1) + "M";
	} else if (num >= 1e3) {
		return (num / 1e3).toFixed(1) + "K";
	} else {
		return num.toString();
	}
};

export const marketCapShorten = (input) => {
	let num;
	if (input !== 0 && input < 1000) {
		return input;
	}
	if (typeof input === "string") {
		num = parseFloat(input.replace(/,/g, ""));
	} else {
		num = input;
	}
	if (num >= 1e6) {
		return Math.floor(num / 1e6).toLocaleString() + "M";
	} else if (num >= 1e3) {
		return Math.floor(num / 1e3).toLocaleString() + "K";
	} else {
		return num.toString();
	}
};

export const formatDecimals = (number) => {
	if (number === null || number === undefined) return number;

	let formattedNumber = number;

	if (isNaN(formattedNumber)) return number;

	// Convert scientific notation to full decimal representation
	if (typeof formattedNumber === "number") {
		formattedNumber = formattedNumber.toFixed(20);
	}

	formattedNumber = formattedNumber.replace(/\.?0+$/, "");

	const [integerPart, decimalPart] = formattedNumber.toString().split(".");

	if (!decimalPart) {
		return formattedNumber;
	}

	const firstDecimal = decimalPart[0];
	const restDecimals = decimalPart.slice(1);

	// Count leading zeros
	const leadingZeros = restDecimals.match(/^0*/)[0];
	const zeroCount = leadingZeros.length;
	if (zeroCount < 5) {
		return formattedNumber;
	}
	// Get the remaining significant digits
	const significantDigits = restDecimals.slice(zeroCount);

	return (
		<>
			{integerPart}.{firstDecimal}
			{zeroCount > 0 && <sub>{zeroCount}</sub>}
			{significantDigits && significantDigits}
		</>
	);
};
