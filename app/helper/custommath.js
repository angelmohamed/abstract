import config from '../config/config';


export function shortText(address) {
    try {
        var addr = address.substring(0, 4);
        var addr1 = address.substring(36, 42);
        var concat = addr + "...." + addr1;
        return concat;
    } catch (err) {
        return "";
    }
}
