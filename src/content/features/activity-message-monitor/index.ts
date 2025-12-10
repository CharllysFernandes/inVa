import { LIMITS, SELECTORS, logger, waitForElement } from "@shared/core";

const COMPONENT = "activity-message-monitor" as const;
const WARNING_SYMBOL = "\u26A0";
const SUCCESS_SYMBOL = "\u2705";
const LOADER_INDICATOR_STATE = "invaKbLoaderState";
const LOADER_INDICATOR_CLASS = "inva-kb-loader-indicator";
let initialized = false;

function applyLoaderIndicator(state: "warning" | "success"): void {
  const loader = document.querySelector<HTMLElement>(
    SELECTORS.KNOWLEDGE_BASE_LOADER
  );

  if (!loader) {
    void logger.warn(
      COMPONENT,
      "Knowledge base loader not found; unable to show indicator",
      { state }
    );
    return;
  }

  if (loader.dataset[LOADER_INDICATOR_STATE] === state) {
    void logger.debug(COMPONENT, "Loader indicator already set", { state });
    return;
  }

  let indicator = loader.querySelector<HTMLElement>(
    `.${LOADER_INDICATOR_CLASS}`
  );
  if (!indicator) {
    indicator = document.createElement("span");
    indicator.className = LOADER_INDICATOR_CLASS;
    loader.insertBefore(indicator, loader.firstChild);
  }

  loader.style.display = "flex";
  loader.style.setProperty("--fa", "unset");
  loader.style.setProperty("--fa--fa", "unset");

  if (state === "warning") {
    loader.style.color = "red";
    indicator.textContent = `${WARNING_SYMBOL} `;
    void logger.info(
      COMPONENT,
      "Applied warning state to knowledge base loader"
    );
  } else {
    loader.style.color = "#2e7d32";
    indicator.textContent = `${SUCCESS_SYMBOL} `;
    void logger.info(
      COMPONENT,
      "Applied success state to knowledge base loader"
    );
  }

  loader.dataset[LOADER_INDICATOR_STATE] = state;
}

function showLoaderAlertIfNeeded(): void {
  applyLoaderIndicator("warning");
}

function showLoaderSuccessIndicator(): void {
  applyLoaderIndicator("success");
}

async function monitorActivityMessageArticles(): Promise<void> {
  void logger.debug(COMPONENT, "Waiting for activity message articles", {
    selector: SELECTORS.ACTIVITY_MESSAGE_ARTICLES,
    timeoutMs: LIMITS.DOM_OBSERVER_TIMEOUT_MS,
  });

  const element = await waitForElement<HTMLElement>(
    SELECTORS.ACTIVITY_MESSAGE_ARTICLES,
    LIMITS.DOM_OBSERVER_TIMEOUT_MS
  );

  if (!element) {
    void logger.warn(
      COMPONENT,
      "Activity message articles not located before timeout"
    );
    showLoaderAlertIfNeeded();
    return;
  }

  showLoaderSuccessIndicator();
  if (!element.dataset.successAlertApplied) {
    element.insertAdjacentText("afterbegin", `${SUCCESS_SYMBOL} `);
    element.dataset.successAlertApplied = "true";
  }

  void logger.info(COMPONENT, "Found activity message articles", {
    childCount: element.childElementCount,
  });
}

export function initializeActivityMessageMonitor(): void {
  if (initialized) {
    void logger.debug(COMPONENT, "Monitor already initialized");
    return;
  }

  initialized = true;
  void logger.info(COMPONENT, "Initializing activity message monitor");

  void monitorActivityMessageArticles().catch((error) => {
    void logger.warn(
      COMPONENT,
      "Failed to monitor activity message articles",
      { error: String(error) }
    );
  });
}
