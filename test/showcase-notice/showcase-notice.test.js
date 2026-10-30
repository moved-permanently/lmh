import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { STORAGE_KEY, noticeApplies } from '../../scripts/showcase-notice.js';

const view = (patch) => ({
  framed: false, pathname: '/en/', acknowledged: false, ...patch,
});

describe('showcase notice', () => {
  test('acknowledgement is stored under the lmh key', () => {
    assert.equal(STORAGE_KEY, 'lmh-showcase-acknowledged');
  });

  test('shows on a top-level page that was not acknowledged', () => {
    assert.equal(noticeApplies(view()), true);
    assert.equal(noticeApplies(view({ pathname: '/en/products/forklift-trucks' })), true);
  });

  test('never inside an iframe (DA preview, Experience Workspace)', () => {
    assert.equal(noticeApplies(view({ framed: true })), false);
  });

  test('never under /tools/', () => {
    assert.equal(noticeApplies(view({ pathname: '/tools/catalog-browser/index.html' })), false);
  });

  test('not again once acknowledged in this browser', () => {
    assert.equal(noticeApplies(view({ acknowledged: true })), false);
  });
});
