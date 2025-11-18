const userAgent = navigator.userAgent.toLowerCase();
const mobileRegex = /iphone|ipad|ipod|android|blackberry|windows phone/g;

const isMobile = mobileRegex.test(userAgent);

export default isMobile;
