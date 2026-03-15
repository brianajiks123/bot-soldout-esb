const actions = require('./puppeteerActions');
const { launch } = require('./browser');
const { delay } = require('../utils/delay');
const logger = require('../utils/logger');
const InvariantError = require('../errors/InvariantError');

const ESB_BASE_URL = process.env.ESB_BASE_URL || '';
const SEARCH_INPUT = "input[placeholder='Search Menu Name or Short Name']";

async function checkLoginStatus() {
  logger.info('Checking login status...');
  await launch(`${ESB_BASE_URL}/site/login`);
  return actions.elementExists("a[href='/site/logout']");
}

async function loginAction({ username, password }) {
  logger.info(`Logging in as ${username}...`);
  await actions.typeIntoVisible('#loginform-username', username);
  await actions.typeIntoVisible('#loginform-password', password);
  await actions.click('#btnLogin');
  await delay(2000);
  const hasAlert = await actions.elementExists('.swal2-confirm.swal2-styled');
  if (hasAlert) {
    await actions.click('.swal2-confirm.swal2-styled');
    await actions.waitForNavigation();
  }
}

async function gotoMasterMenu(subMenuSelector) {
  logger.info(`Navigating to master menu: ${subMenuSelector}`);
  await actions.click("a[href='/master/index']");
  await actions.click(`a[href='/${subMenuSelector}']`);
}

async function gotoCategoryMenuByBranch(branchName, categoryName, action = 'view') {
  logger.info(`Accessing category "${categoryName}" at branch "${branchName}"`);
  await delay(2000);
  await actions.performActionByName(branchName, action);
  await actions.waitForNavigation();
  await delay(4000);
  const linkId = await actions.clickTabByText('.tab-links', categoryName, 'id');
  return linkId && linkId.includes('link') ? linkId.replace('link', '') : null;
}

async function searchMenu(keyword) {
  await actions.typeIntoVisible(SEARCH_INPUT, keyword);
}

async function clearSearchMenu() {
  await actions.clearInput(SEARCH_INPUT);
  await delay(1000);
}

async function saveAndHandleAlert() {
  await actions.click('#btnSave');
  await delay(3000);
  const hasAlert = await actions.elementExists('.bootbox-alert');
  if (hasAlert) {
    await actions.click("button[data-bb-handler='ok']");
    await delay(1000);
    await actions.click('#btnCancel');
  }
}

const UPLOAD_MODES = {
  CREATE:    { codeMode: 1, uploadEl: '#fileUpload',    buttonUpload: '#btnSubmitUpload' },
  EXTENSION: { codeMode: 2, uploadEl: '#fileImport',    buttonUpload: '#btnSubmitImport' },
  ACTIVATE:  { codeMode: 3, uploadEl: '#voucherActivate', buttonUpload: '#btnSubmitActivate' },
};

async function uploadVoucherExcelFile(filePath, mode) {
  if (!UPLOAD_MODES[mode]) throw new InvariantError(`Invalid mode: ${mode}. Valid: CREATE, EXTENSION, ACTIVATE`);
  const { codeMode, uploadEl, buttonUpload } = UPLOAD_MODES[mode];
  await delay(1000);
  await actions.click('button.btnUpload');
  await delay(1000);
  await actions.clickWithEvaluate(`a[href='/voucher/#?mode=${codeMode}']`);
  await delay(1000);
  await actions.uploadFile(filePath, uploadEl);
  await delay(1000);
  await actions.clickWithEvaluate(buttonUpload);
  await actions.waitForElement('#data-table-upload-queue > tbody > tr');
  const result = await actions.waitForUploadProcess('#data-table-upload-queue > tbody > tr', 'process', 2000);
  if (result.toLowerCase().includes('failed')) {
    const fileDownloadUrl = await actions.getAttrContent('#data-table-upload-queue > tbody > tr > td:nth-child(4) > a', 'href');
    return { result, fileDownloadUrl };
  }
  await actions.clickWithEvaluate('#close-upload-queue');
  return { result };
}

module.exports = {
  checkLoginStatus,
  loginAction,
  gotoMasterMenu,
  gotoCategoryMenuByBranch,
  searchMenu,
  clearSearchMenu,
  saveAndHandleAlert,
  uploadVoucherExcelFile,
};
