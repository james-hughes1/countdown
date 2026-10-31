/**
 * Browser entry point: loads config, renders the countdown and keeps it ticking.
 */
import { getTimeRemaining, pad } from './countdown.js';
import { ConfigError, parseConfig } from './config.js';

const CONFIG_URL = '/config.json';

const elements = {
  title: document.getElementById('title'),
  timer: document.getElementById('timer'),
  message: document.getElementById('message'),
  error: document.getElementById('error'),
};

async function loadConfig() {
  const response = await fetch(CONFIG_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Could not load ${CONFIG_URL} (HTTP ${response.status}).`);
  }
  return parseConfig(await response.json());
}

function applyTheme(theme) {
  for (const [key, value] of Object.entries(theme)) {
    document.documentElement.style.setProperty(`--color-${key}`, value);
  }
}

/** Build one block per unit and return the value elements keyed by unit. */
function buildTimer(units) {
  const valueElements = {};
  elements.timer.replaceChildren(
    ...units.map((unit) => {
      const block = document.createElement('div');
      block.className = 'unit';

      const value = document.createElement('span');
      value.className = 'unit__value';
      valueElements[unit] = value;

      const label = document.createElement('span');
      label.className = 'unit__label';
      label.textContent = unit;

      block.append(value, label);
      return block;
    }),
  );
  return valueElements;
}

function showError(error) {
  console.error(error);
  const problems = error instanceof ConfigError ? error.problems : [error.message];
  const list = document.createElement('ul');
  list.append(
    ...problems.map((problem) => {
      const item = document.createElement('li');
      item.textContent = problem;
      return item;
    }),
  );
  elements.error.replaceChildren('Something is wrong with the countdown setup:', list);
  elements.error.hidden = false;
}

function start(config) {
  document.title = config.title;
  elements.title.textContent = config.title;
  applyTheme(config.theme);
  const valueElements = buildTimer(config.units);

  const tick = () => {
    const { isComplete, parts } = getTimeRemaining(config.endDate, new Date(), config.units);

    for (const [unit, value] of Object.entries(parts)) {
      valueElements[unit].textContent = pad(value);
    }

    if (isComplete) {
      elements.message.textContent = config.completedMessage;
      elements.message.hidden = !config.completedMessage;
      return;
    }

    // Schedule the next tick on the next whole-second boundary to avoid drift.
    setTimeout(tick, 1000 - (Date.now() % 1000));
  };

  tick();
}

loadConfig().then(start).catch(showError);
