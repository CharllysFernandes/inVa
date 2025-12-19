/**
 * Content Controller - Clean Code
 */

import type { UrlMatcher, FeatureInitializer } from "../../domain/use-cases/content-use-cases";
import { logger } from "@shared/core";

export class ContentController {
  constructor(
    private readonly urlMatcher: UrlMatcher,
    private readonly features: FeatureInitializer
  ) {}

  async initialize(savedUrl: string | null, currentUrl: string): Promise<void> {
    this.features.initializeActivityMonitor();

    if (!savedUrl) {
      void logger.debug("content", "No saved ticket URL found");
      return;
    }

    if (!this.urlMatcher.matches(savedUrl, currentUrl)) {
      void logger.debug("content", "URL does not match", { savedUrl, currentUrl });
      return;
    }

    void logger.info("content", "Matched URL, initializing features", { savedUrl, currentUrl });
    
    this.features.initializeCustomerValidation();
    this.features.initializeKnowledgeBaseControl();
    await this.features.initializeCommentForm(savedUrl);
  }
}
