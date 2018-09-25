
// const REGEX_PHONE = /^\d{11}$/;
const REGEX_PHONE = /^1[3-9]\d{9}$/;

const isValidPhone = (phone) => {
  if (!phone) return false;
  return REGEX_PHONE.test(phone);
}

module.exports = {
  isValidPhone,
};
