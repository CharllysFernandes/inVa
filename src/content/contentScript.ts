/// <reference types="chrome" />

/**
 * Content Script Entry Point - Clean Architecture
 */

import { getStoredCreateTicketUrl, logger, waitForDOMReady } from "@shared/core";
import { MatchUrlUseCase } from "../domain/use-cases/content-use-cases";
import { FeaturesAdapter } from "../infrastructure/adapters/features-adapter";
import { ContentController } from "../presentation/controllers/content-controller";

(async () => {
  try {
    await waitForDOMReady();

    const controller = new ContentController(
      new MatchUrlUseCase(),
      new FeaturesAdapter()
    );

    const savedUrl = await getStoredCreateTicketUrl();
    await controller.initialize(savedUrl ?? null, window.location.href);
  } catch (e) {
    void logger.error("content", "Unexpected error", { error: String(e) });
  }
})();
