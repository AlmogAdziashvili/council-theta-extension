import '@src/Popup.css';
import { RangeBar } from './RangeBar';
import { RangeBarConfig } from './RangeBarConfig';
import { useEffect, useMemo, useState } from 'react';

const TARGET_SELECTOR =
  '#cp-ib-app-main-content > div:nth-child(1) > div > div:nth-child(2) > div.option-wrapper > section > div > div:nth-child(1)';

const TARGET_SELECTOR_INFO =
  '#cp-ib-app-main-content > div._col.flex.grow.border-start > section > div > div.inset-16 > div.ib-row.fdm-widget.fs7.lh-lg.pcon-widget.border-bottom.fdm-widget-narrow';

const PRICE_SELECTOR =
  '#cp-ib-app-main-content > div._col.flex.grow.border-start > section > div > div.quote.numeric.insetx-16.after-16.quote-v.before-16 > div > div.quote-symprice > div.quote-price.text-semibold.lh-sm.fs2 > span:nth-child(1)';

type ContentSnapshot = {
  vwap: string;
  opt_vlm: string;
  iv_last: string;
  iv___hist_vol: string;
  '52w_iv_rank': string;
  '52w_iv_perc': string;
  p_c_int: string;
  p_c_vlm: string;
  iv_cls: string;
  iv_chng: string;
  hist_vol: string;
  hist_vol_cls: string;
  opt_vlm_chng: string;
  market_cap: string;
  p_e: string;
  revenue_shares: string;
  price_book: string;
  price_tangible_book: string;
  eps_growth: string;
  return_on_equity: string;
  quick_ratio: string;
  consensus_recommendation: string;
  long_term_growth_rate: string;
  price_to_eps: string;
  sales__quarterly_: string;
  target_price: string;
  dividend: string;
  ex_date: string;
  dividend_yield: string;
  margin_requirements: string;
  price: string;
};

type PopupState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; snapshot: ContentSnapshot };

const getActiveTabId = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) {
    throw new Error('No active tab is available.');
  }

  return tab.id;
};

const readCurrentDocument = async (): Promise<ContentSnapshot> => {
  const tabId = await getActiveTabId();
  const [injectionResult] = await chrome.scripting.executeScript<[string], { innerText?: string; found: boolean }>({
    target: { tabId },
    args: [TARGET_SELECTOR],
    func: selector => {
      const element = document.querySelector(selector);

      if (!element) {
        return {
          found: false,
        };
      }

      const htmlElement = element as HTMLElement;

      return {
        found: true,
        innerText: htmlElement.innerText,
      };
    },
  });

  if (!injectionResult?.result) {
    throw new Error('The current page did not return any content.');
  }

  if (!injectionResult.result.found) {
    throw new Error('The required content selector was not found on this page. This is probably the wrong page.');
  }

  const rawOptionMetrics = injectionResult.result.innerText?.split('\n');
  const optionMetricsPairs = rawOptionMetrics?.reduce<string[][]>((acc, curr, index) => {
    if (index % 2 === 0) {
      acc.push([curr.replaceAll(/[^a-zA-Z0-9]/g, '_').toLowerCase()]);
    } else {
      acc[acc.length - 1].push(curr);
    }
    return acc;
  }, []);
  const optionMetrics = Object.fromEntries(optionMetricsPairs ?? []);
  if (optionMetrics.opt_vlm.endsWith('M')) {
    optionMetrics.opt_vlm = String(Number.parseFloat(optionMetrics.opt_vlm) * 1_000).replace('M', 'K');
  }

  const [injectionResultInfo] = await chrome.scripting.executeScript<[string], { innerText?: string; found: boolean }>({
    target: { tabId },
    args: [TARGET_SELECTOR_INFO],
    func: selector => {
      const element = document.querySelector(selector);

      if (!element) {
        return {
          found: false,
        };
      }

      const htmlElement = element as HTMLElement;

      return {
        found: true,
        innerText: htmlElement.innerText,
      };
    },
  });

  if (!injectionResultInfo?.result) {
    throw new Error('The current page did not return any content for the info section.');
  }

  if (!injectionResultInfo.result.found) {
    throw new Error(
      'The required content selector for the info section was not found on this page. This is probably the wrong page.',
    );
  }

  const rawInfoMetrics = injectionResultInfo.result.innerText?.split('\n');
  const infoMetricsPairs = rawInfoMetrics?.reduce<string[][]>((acc, curr, index) => {
    if (index % 2 === 0) {
      acc.push([curr.replaceAll(/[^a-zA-Z0-9]/g, '_').toLowerCase()]);
    } else {
      acc[acc.length - 1].push(curr);
    }
    return acc;
  }, []);
  const infoMetrics = Object.fromEntries(infoMetricsPairs ?? []);

  if (infoMetrics.market_cap.endsWith('T')) {
    infoMetrics.market_cap = String(Number.parseFloat(infoMetrics.market_cap) * 1_000_000).replace('T', 'M');
  } else if (infoMetrics.market_cap.endsWith('B')) {
    infoMetrics.market_cap = String(Number.parseFloat(infoMetrics.market_cap) * 1_000).replace('B', 'M');
  }

  const [injectionResultPrice] = await chrome.scripting.executeScript<[string], { innerText?: string; found: boolean }>(
    {
      target: { tabId },
      args: [PRICE_SELECTOR],
      func: selector => {
        const element = document.querySelector(selector);

        if (!element) {
          return {
            found: false,
          };
        }

        const htmlElement = element as HTMLElement;

        return {
          found: true,
          innerText: htmlElement.innerText,
        };
      },
    },
  );

  if (!injectionResultPrice?.result) {
    throw new Error('The current page did not return any content for the price section.');
  }

  if (!injectionResultPrice.result.found) {
    throw new Error(
      'The required content selector for the price section was not found on this page. This is probably the wrong page.',
    );
  }

  const price = injectionResultPrice.result.innerText ?? '';

  return {
    ...optionMetrics,
    ...infoMetrics,
    price,
  };
};

const Popup = () => {
  const [state, setState] = useState<PopupState>({ status: 'loading' });

  const loadDocument = async () => {
    setState({ status: 'loading' });

    try {
      const snapshot = await readCurrentDocument();
      console.log('Content snapshot:', snapshot);
      setState({ status: 'ready', snapshot });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to read the current document.';
      setState({ status: 'error', message });
    }
  };

  useEffect(() => {
    void loadDocument();
  }, []);

  const daysUntilExDate = useMemo(() => {
    if (state.status !== 'ready') {
      return null;
    }

    const exDateStr = state.snapshot.ex_date;
    const exDate = new Date(exDateStr);
    const today = new Date();

    if (isNaN(exDate.getTime())) {
      return null;
    }

    const diffTime = exDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [state]);

  return (
    <main className="popup-shell">
      <header className="popup-header">
        <div>
          <h1>Council Theta Extension</h1>
          <p>Read the target content from the active tab and render it in this React popup.</p>
        </div>
        <button className="refresh-button" onClick={() => void loadDocument()} type="button">
          Refresh
        </button>
      </header>

      {state.status === 'loading' && <section className="status-card">Reading the selected page content...</section>}

      {state.status === 'error' && (
        <section className="status-card error-card">
          <strong>Unable to read the expected page content.</strong>
          <p>{state.message}</p>
          <p>Open the correct page where that selector exists, then refresh the popup.</p>
        </section>
      )}

      {state.status === 'ready' && (
        <div className="range-bars-container">
          <RangeBar value={state.snapshot['52w_iv_rank']} config={RangeBarConfig['52w_iv_rank']} />
          <RangeBar value={state.snapshot['52w_iv_perc']} config={RangeBarConfig['52w_iv_perc']} />
          <RangeBar value={state.snapshot.opt_vlm} config={RangeBarConfig['opt_vlm']} />
          <RangeBar value={state.snapshot.iv___hist_vol} config={RangeBarConfig['iv___hist_vol']} max={200} />
          <RangeBar value={state.snapshot.p_c_int} config={RangeBarConfig['p_c_int']} max={2} />
          <RangeBar value={state.snapshot.price} config={RangeBarConfig['price']} max={300} />
          <RangeBar
            value={daysUntilExDate !== null ? String(daysUntilExDate) : 'N/A'}
            config={RangeBarConfig['days_until_ex_date']}
            max={90}
          />
          <RangeBar value={state.snapshot.dividend_yield} config={RangeBarConfig['dividend_yield']} max={10} />
          <RangeBar value={state.snapshot.market_cap} config={RangeBarConfig['market_cap']} max={20_000} />
        </div>
      )}
    </main>
  );
};

export default Popup;
