
const mongoose = require('mongoose');
const User = mongoose.model('user');

const isAdminToken = async (userToken) => {
  if (!userToken) return false;
  const user = await User.checkToken(userToken);
  if (!user) return false;
  // console.log('isAdminToken: ', user.admin);
  return user.admin;
}

module.exports = {
  isAdminToken,
};
