import { LIMITS, logger, waitForElement } from "@shared/core";

const USER_SCRIPT_REGEX = /var\s+\$user\s*=\s*(\{[\s\S]*?\});/;
const USERNAME_ALERT_ID = "inva-username-alert";

type PageUser = {
  email?: string;
  [key: string]: unknown;
};

type UsernameInputState = {
  observer: MutationObserver;
  inputListener: () => void;
  valueOverridden: boolean;
};

const observedInputs = new WeakSet<HTMLInputElement>();
const inputStates = new WeakMap<HTMLInputElement, UsernameInputState>();
const activeInputs = new Set<HTMLInputElement>();
let discoveryObserver: MutationObserver | null = null;
let observationInitialized = false;
let cachedUserEmail: string | null = null;
let userEmailLogged = false;
let emailPollInterval: number | null = null;
let emailPollTimeout: number | null = null;

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function clearEmailPolling(): void {
  if (emailPollInterval !== null) {
    window.clearInterval(emailPollInterval);
    emailPollInterval = null;
  }
  if (emailPollTimeout !== null) {
    window.clearTimeout(emailPollTimeout);
    emailPollTimeout = null;
  }
}

function tryUpdateUserEmail(): boolean {
  if (cachedUserEmail) {
    return true;
  }

  const scripts = document.querySelectorAll<HTMLScriptElement>("script");
  for (const script of Array.from(scripts)) {
    const content = script.textContent;
    if (!content) continue;

    const match = USER_SCRIPT_REGEX.exec(content);
    if (!match) continue;

    try {
      const parsed = JSON.parse(match[1]) as PageUser;
      if (typeof parsed.email === "string") {
        cachedUserEmail = parsed.email;
        if (!userEmailLogged) {
          userEmailLogged = true;
          console.log("$user.email:", cachedUserEmail);
        }
        updateAllActiveInputs();
        return true;
      }
    } catch (error) {
      void logger.debug("content", "Failed to parse $user script", {
        error: String(error),
      });
    }
  }

  return false;
}

function compareUsernameWithUserEmail(username: string): boolean {
  if (typeof username !== "string" || !username) {
    return false;
  }

  if (!cachedUserEmail) {
    tryUpdateUserEmail();
  }

  if (!cachedUserEmail) {
    return false;
  }

  return normalize(username) === normalize(cachedUserEmail);
}

function hideUsernameAlert(): void {
  const existing = document.getElementById(USERNAME_ALERT_ID);
  if (existing) {
    existing.remove();
  }
}

async function showUsernameAlert(): Promise<void> {
  const container = await waitForElement<HTMLElement>(
    "#customer",
    LIMITS.DOM_OBSERVER_TIMEOUT_MS
  );
  if (!container) {
    return;
  }

  if (container.querySelector(`#${USERNAME_ALERT_ID}`)) {
    return;
  }

  const alert = document.createElement("div");
  alert.id = USERNAME_ALERT_ID;
  alert.setAttribute("role", "alert");
  alert.style.marginTop = "12px";
  alert.style.padding = "8px 8px";
  alert.style.borderRadius = "4px";
  alert.style.backgroundColor = "#fdecea";
  alert.style.color = "#b3261e";
  alert.style.border = "1px solid #f2b8b5";
  alert.style.display = "flex";
  alert.style.alignItems = "flex-start";
  alert.style.gap = "8px";
  alert.style.fontSize = "small";

  const icon = document.createElement("span");
  icon.textContent = "\u26A0";
  icon.style.fontWeight = "bold";
  icon.style.marginTop = "2px";

  const message = document.createElement("span");
  message.textContent = "Altere cliente para o login do usuário";

  alert.append(icon, message);
  container.appendChild(alert);
}

function updateUsernameAlert(isMatch: boolean): void {
  if (isMatch) {
    void showUsernameAlert();
  } else {
    hideUsernameAlert();
  }
}

function handleInputValueChange(input: HTMLInputElement): void {
  const matchesEmail = compareUsernameWithUserEmail(input.value);
  console.log("output_customer_username changed:", input.value, {
    matchesUserEmail: matchesEmail,
  });
  updateUsernameAlert(matchesEmail);
}

function updateAllActiveInputs(): void {
  for (const input of Array.from(activeInputs)) {
    handleInputValueChange(input);
  }
}

function cleanupUsernameInput(input: HTMLInputElement): void {
  if (!observedInputs.has(input)) {
    return;
  }

  observedInputs.delete(input);
  activeInputs.delete(input);

  const state = inputStates.get(input);
  if (state) {
    state.observer.disconnect();
    input.removeEventListener("input", state.inputListener);
    if (state.valueOverridden) {
      Reflect.deleteProperty(input, "value");
    }
    inputStates.delete(input);
  }

  hideUsernameAlert();
  void logger.debug("content", "Stopped observing output_customer_username");
}

function setupUsernameInput(input: HTMLInputElement): void {
  if (observedInputs.has(input)) {
    return;
  }

  const valueDescriptor = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(input),
    "value"
  );

  let valueOverridden = false;
  const syncAttribute = () => {
    const currentAttr = input.getAttribute("value");
    if (currentAttr !== input.value) {
      input.setAttribute("value", input.value);
    }
  };

  if (valueDescriptor?.get && valueDescriptor?.set) {
    Object.defineProperty(input, "value", {
      configurable: true,
      enumerable: valueDescriptor.enumerable ?? false,
      get(this: HTMLInputElement) {
        return valueDescriptor.get!.call(this);
      },
      set(this: HTMLInputElement, value: string) {
        valueDescriptor.set!.call(this, value);
        syncAttribute();
      },
    });
    valueOverridden = true;
  }

  const inputListener = () => syncAttribute();
  input.addEventListener("input", inputListener);
  syncAttribute();

  const observer = new MutationObserver(() => handleInputValueChange(input));
  observer.observe(input, {
    attributes: true,
    attributeFilter: ["value"],
    attributeOldValue: true,
  });

  observedInputs.add(input);
  activeInputs.add(input);
  inputStates.set(input, { observer, inputListener, valueOverridden });
  void logger.debug("content", "Observing output_customer_username input");
  handleInputValueChange(input);
}

function connectDiscoveryObserver(): void {
  if (discoveryObserver || !document.body) {
    return;
  }

  const isUsernameInput = (node: Node): node is HTMLInputElement =>
    node instanceof HTMLInputElement && node.id === "output_customer_username";

  const collectUsernameInputs = (node: Node): HTMLInputElement[] => {
    const inputs: HTMLInputElement[] = [];
    if (isUsernameInput(node)) {
      inputs.push(node);
    }
    if (node instanceof Element || node instanceof DocumentFragment) {
      inputs.push(
        ...Array.from(
          node.querySelectorAll<HTMLInputElement>("#output_customer_username")
        )
      );
    }
    return inputs;
  };

  discoveryObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of Array.from(mutation.removedNodes)) {
        for (const input of collectUsernameInputs(node)) {
          cleanupUsernameInput(input);
        }
      }
      for (const node of Array.from(mutation.addedNodes)) {
        for (const input of collectUsernameInputs(node)) {
          setupUsernameInput(input);
        }
      }
    }
  });

  discoveryObserver.observe(document.body, { childList: true, subtree: true });
}

function startUserEmailPolling(): void {
  if (tryUpdateUserEmail()) {
    return;
  }

  if (emailPollInterval !== null) {
    return;
  }

  emailPollInterval = window.setInterval(() => {
    if (tryUpdateUserEmail()) {
      clearEmailPolling();
    }
  }, 500);

  emailPollTimeout = window.setTimeout(() => {
    clearEmailPolling();
    void logger.debug("content", "Timeout waiting for $user email");
  }, 10000);
}

function cleanup(): void {
  clearEmailPolling();

  if (discoveryObserver) {
    discoveryObserver.disconnect();
    discoveryObserver = null;
  }

  for (const input of Array.from(activeInputs)) {
    cleanupUsernameInput(input);
  }

  activeInputs.clear();
  cachedUserEmail = null;
  userEmailLogged = false;
  hideUsernameAlert();
}

export function initializeCustomerUsernameMonitor(): void {
  if (observationInitialized) {
    return;
  }

  observationInitialized = true;
  startUserEmailPolling();

  const existingInputs = document.querySelectorAll<HTMLInputElement>(
    "#output_customer_username"
  );
  for (const input of Array.from(existingInputs)) {
    setupUsernameInput(input);
  }

  void waitForElement<HTMLInputElement>(
    "#output_customer_username",
    LIMITS.DOM_OBSERVER_TIMEOUT_MS
  ).then((input) => {
    if (input) {
      setupUsernameInput(input);
    }
  });

  connectDiscoveryObserver();

  window.addEventListener(
    "beforeunload",
    () => {
      cleanup();
      observationInitialized = false;
    },
    { once: true }
  );
}
