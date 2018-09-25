
const { listCensorship } = require('../../util/files');
// console.log(listCensorship)
// console.log(listCensorship)

module.exports.checkCensorship = function (content) {
  // console.log('checkCensorship: ', listCensorship);

  if (!content || !listCensorship) return true;

  // TODO: 应该进行忽略大小写判断
  return !listCensorship.includes(content.toLowerCase());
}

