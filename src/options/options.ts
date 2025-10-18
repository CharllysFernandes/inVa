/// <reference types="chrome" />

import { DEFAULT_HIGHLIGHT_COLOR } from "../shared/constants";
import { getStoredHighlightColor, saveHighlightColor } from "../shared/utils";

const form = document.getElementById("optionsForm") as HTMLFormElement | null;
const colorPicker = document.getElementById("highlightColor") as HTMLInputElement | null;

const loadOptions = async () => {
  const highlightColor = await getStoredHighlightColor();
  if (colorPicker) {
    colorPicker.value = highlightColor;
  }
};

const saveOptions = async (event: SubmitEvent) => {
  event.preventDefault();

  if (!colorPicker) {
    return;
  }

  const status = document.getElementById("status");

  try {
    await saveHighlightColor(colorPicker.value || DEFAULT_HIGHLIGHT_COLOR);

    if (status) {
      status.textContent = "Preferência salva!";
      setTimeout(() => {
        status.textContent = "";
      }, 1200);
    }
  } catch (error) {
    console.error("Erro ao salvar preferências", error);
    if (status) {
      status.textContent = "Não conseguimos salvar agora. Tente novamente.";
    }
  }
};

if (form) {
  form.addEventListener("submit", saveOptions);
}

void loadOptions();
