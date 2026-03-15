const { getPage } = require('./browser');
const logger = require('../utils/logger');
const { delay } = require('../utils/delay');

// ─── Wait Helpers ─────────────────────────────────────────────────────────────

async function waitForElement(selector, timeout = 10000, interval = 1000) {
  let elapsed = 0;
  while (elapsed < timeout) {
    const found = await getPage().evaluate((sel) => !!document.querySelector(sel), selector);
    if (found) return true;
    await delay(interval);
    elapsed += interval;
  }
  throw new Error(`Element "${selector}" not found after ${timeout / 1000}s`);
}

async function waitForNavigation() {
  await getPage().waitForNavigation({ waitUntil: 'networkidle2' });
}

// ─── Click Actions ────────────────────────────────────────────────────────────

async function click(selector) {
  await waitForElement(selector);
  logger.debug(`Clicking: ${selector}`);
  await getPage().click(selector);
}

async function clickWithEvaluate(selector) {
  logger.debug(`Clicking via evaluate: ${selector}`);
  await getPage().evaluate((sel) => document.querySelector(sel).click(), selector);
}

// ─── Input Actions ────────────────────────────────────────────────────────────

async function typeIntoVisible(selector, text) {
  await waitForElement(selector);

  const inputId = await getPage().evaluate((sel) => {
    const inputs = document.querySelectorAll(sel);
    for (const input of inputs) {
      if (input.offsetParent !== null && !input.disabled && !input.readOnly) {
        if (!input.id) input.id = `temp-input-${Date.now()}`;
        return input.id;
      }
    }
    return null;
  }, selector);

  if (!inputId) throw new Error(`No visible input found for: ${selector}`);

  await getPage().waitForFunction(
    (id) => {
      const el = document.getElementById(id);
      return el && !el.disabled && !el.readOnly && el.offsetParent !== null;
    },
    { timeout: 10000 },
    inputId
  );

  await getPage().evaluate((id, value) => {
    const input = document.getElementById(id);
    input.removeAttribute('readonly');
    input.removeAttribute('disabled');
    input.focus();
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    if (window.jQuery) {
      window.jQuery(input).trigger('input');
      window.jQuery(input).trigger('change');
      window.jQuery(input).trigger('keyup');
    }
  }, inputId, text);

  await delay(500);
  logger.debug(`Typed "${text}" into ${selector}`);
}

async function clearInput(selector) {
  await waitForElement(selector);

  const inputId = await getPage().evaluate((sel) => {
    const inputs = document.querySelectorAll(sel);
    for (const input of inputs) {
      if (input.offsetParent !== null && !input.disabled && !input.readOnly) {
        if (!input.id) input.id = `temp-clear-${Date.now()}`;
        return input.id;
      }
    }
    return null;
  }, selector);

  if (!inputId) {
    logger.warn(`No visible input to clear for: ${selector}`);
    return;
  }

  await getPage().evaluate((id) => {
    const input = document.getElementById(id);
    input.focus();
    input.value = '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    if (window.jQuery) {
      window.jQuery(input).trigger('input');
      window.jQuery(input).trigger('change');
      window.jQuery(input).trigger('keyup');
    }
  }, inputId);

  logger.debug(`Cleared input: ${selector}`);
}

async function selectOption(selector, value) {
  await waitForElement(selector);
  await getPage().select(selector, value);
}

async function uploadFile(filePath, selectorInput = "input[type='file']") {
  await waitForElement(selectorInput);
  await getPage().locator(selectorInput).setInputFiles(filePath);
}

// ─── Read Actions ─────────────────────────────────────────────────────────────

async function getTextContent(selector) {
  return getPage().evaluate((sel) => document.querySelector(sel).innerText, selector);
}

async function getAttrContent(selector, attr) {
  return getPage().evaluate((sel, a) => document.querySelector(sel).getAttribute(a), selector, attr);
}

async function getInputValue(selector) {
  await waitForElement(selector);
  return getPage().evaluate((sel) => {
    const inputs = document.querySelectorAll(sel);
    for (const input of inputs) {
      if (input.offsetParent !== null) return input.value;
    }
    return document.querySelector(sel).value;
  }, selector);
}

async function elementExists(selector) {
  return getPage().evaluate((sel) => !!document.querySelector(sel), selector);
}

async function elementIsChecked(selector) {
  return getPage().evaluate((sel) => document.querySelector(sel).checked, selector);
}

// ─── Table / Row Actions ──────────────────────────────────────────────────────

async function getMenuRowCount(tableSelector) {
  const count = await getPage().evaluate((sel) => document.querySelectorAll(sel).length, tableSelector);
  logger.debug(`Row count for "${tableSelector}": ${count}`);
  return count;
}

async function processMenuRowForSoldout(rowIndex, categoryId, config) {
  await getPage().evaluate(
    (index, id, cfg) => {
      const rows = document.querySelectorAll(`#branch-menu-detail-table_${id} > tbody tr`);
      const row = rows[index];
      if (!row) return;
      const menuName = row.querySelector('td:nth-child(3)').textContent.trim();
      const matched = cfg.find((c) => c.name === menuName);
      if (!matched) return;
      const checkbox = row.querySelector('td:nth-child(7) input');
      if (checkbox.checked !== matched.soldout) {
        checkbox.click();
        console.log(`${matched.name} | SOLDOUT: ${checkbox.checked} → ${matched.soldout}`);
      }
    },
    rowIndex,
    categoryId,
    config
  );
}

async function processMenuRowForUpdateMenuPrice(rowIndex, categoryId, config) {
  await getPage().evaluate(
    (index, id, cfg) => {
      function updateInputValue(input, value) {
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const rows = document.querySelectorAll(
        `#menu-template-detail-table_${id} > tbody tr.js-sortable-tr-menutemplate.menuHead`
      );
      const row = rows[index];
      if (!row) return;
      const menuName = row.querySelector('td:nth-child(3)').textContent.trim();
      const matched = cfg.find((c) => c.name === menuName);
      if (!matched) return;
      const priceInput = row.querySelector('td:nth-child(6) input');
      updateInputValue(priceInput, matched.price);
      console.log(`${matched.name} | OLD: ${priceInput.value} → NEW: ${matched.price}`);
    },
    rowIndex,
    categoryId,
    config
  );
}

// ─── Navigation Helpers ───────────────────────────────────────────────────────

async function performActionByName(name, action) {
  const rows = await getPage().$('tbody tr');
  for (const row of rows) {
    const text = await row.evaluate((el) => el.innerText);
    if (!text.includes(name)) continue;

    const actionMap = { edit: "a[data-action='update']", view: "a[data-action='view']", delete: "a[data-action='delete']" };
    const btn = await row.$(actionMap[action.toLowerCase()]);
    if (btn) await btn.click();
    return;
  }
}

async function clickTabByText(selector, text, dataAttr = null) {
  const tabs = await getPage().$(selector);
  for (const tab of tabs) {
    const tabText = await tab.evaluate((el) => el.textContent.trim());
    const tabId = await tab.evaluate((el) => el.id);
    if (tabText !== text) continue;

    await clickWithEvaluate(`#${tabId}`);
    logger.debug(`Clicked tab: "${text}"`);
    await delay(3000);

    if (dataAttr) {
      return tab.evaluate((el, attr) => el.getAttribute(attr), dataAttr);
    }
    return;
  }
  throw new Error(`Tab "${text}" not found`);
}

async function waitForUploadProcess(selector, content, interval = 500, timeout = 10000) {
  let elapsed = 0;
  while (elapsed < timeout) {
    const text = await getTextContent(selector);
    if (text.toLowerCase().includes('\t') && !text.toLowerCase().includes(content)) {
      return text;
    }
    await delay(interval);
    elapsed += interval;
  }
  throw new Error(`Upload process content "${content}" not found after ${timeout / 1000}s`);
}

module.exports = {
  waitForElement,
  waitForNavigation,
  click,
  clickWithEvaluate,
  typeIntoVisible,
  clearInput,
  selectOption,
  uploadFile,
  getTextContent,
  getAttrContent,
  getInputValue,
  elementExists,
  elementIsChecked,
  getMenuRowCount,
  processMenuRowForSoldout,
  processMenuRowForUpdateMenuPrice,
  performActionByName,
  clickTabByText,
  waitForUploadProcess,
};
