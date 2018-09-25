
const fs = require('fs');
const path = require('path');

// TODO: Note that this is synchronous library.
// TODO: 这是个同步库
const lineByLine = require('n-readlines');

// 通用函数 载入文件内容 并形成列表
function loadConfigFiles2Array(filename) {
  const logger = require("./logger");
  // logger.info(`loadConfigFiles2Array ${filename}`);

  if (!fs.existsSync(filename)) {
    logger.error(`loadConfigFiles2Array error, file not found:  ${filename}`);
    return null;
  }

  // const liner = new lineByLine(path.join(__dirname, '/../config', 'admin.cfg'));
  const liner = new lineByLine(filename);
  let line;
  let list = [];
  while (line = liner.next()) {
    // NOTE: trim() 方法会从一个字符串的两端删除空白字符。
    // NOTE: 在这个上下文中的空白字符是所有的空白字符 (space, tab, no-break space 等) 以及所有行终止符字符（如 LF，CR）。
    // const pure = line.toString('UTF-8').replace(/[\r\n]+$/, '');
    const pure = line.toString('UTF-8').trim();
    if ((pure.length > 0) && !pure.startsWith('#')) {
      list.push(pure);
    }
  }

  return list;
}

// TODO: 同步函数。应该改成异步函数，但需要await支持
// 载入管理员列表
loadAdminList = function () {
  const list = loadConfigFiles2Array(path.join(__dirname, '/../config', 'admin.cfg'));
  // console.log('---loadAdminList list: ', list);
  return list;
}

module.exports.listLegalAdmin = loadAdminList();


// 载入敏感词检查列表
loadCensorshipList = function () {
  const list = loadConfigFiles2Array(path.join(__dirname, '/../config', 'censorship.cfg'));
  // console.log('---loadCensorshipList list: ', list);
  return list ? list : [];
}

module.exports.listCensorship = loadCensorshipList();


// EULA文件内容
const eulaInfo = fs.readFileSync(path.join(__dirname, '/../public', 'eula.txt'), 'UTF-8');

module.exports.eulaInfo = eulaInfo;

// 可支持版本列表
loadSupportableClientVersionList = function () {
  const list = loadConfigFiles2Array(path.join(__dirname, '/../config', 'version.cfg'));
  // console.log('---loadSupportableClientVersionList list: ', list);
  if (!list) return null;

  let clients = [];
  let versions = [];
  const regClient = /^client\s*=\s*(\S+)/;
  const regVersion = /^version\s*=\s*(\S+)/;
  for (let i = 0; i < list.length; i++) {
    if (list[i].match(regClient)) {
      const lmc = regClient.exec(list[i]);
      // console.log('files loadSupportableClientVersionList regClient: ', lmc[1]);
      if (lmc && lmc.length >= 2) {
        clients.push(lmc[1].trim());
      }
    }
    if (list[i].match(regVersion)) {
      const lmv = regVersion.exec(list[i]);
      if (lmv && lmv.length >= 2) {
        versions.push(lmv[1].trim());
      }
    }
  }
  return { clients, versions };
}

module.exports.supportableClientVersion = loadSupportableClientVersionList();
