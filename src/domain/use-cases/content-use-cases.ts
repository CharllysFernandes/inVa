/**
 * Use Cases - Content Script
 */

export interface UrlMatcher {
  matches(savedUrl: string, currentUrl: string): boolean;
}

export class MatchUrlUseCase implements UrlMatcher {
  matches(savedUrl: string, currentUrl: string): boolean {
    try {
      const saved = new URL(savedUrl);
      const current = new URL(currentUrl);
      return current.origin === saved.origin && current.pathname.startsWith(saved.pathname);
    } catch {
      return currentUrl.startsWith(savedUrl);
    }
  }
}

export interface FeatureInitializer {
  initializeActivityMonitor(): void;
  initializeCustomerValidation(): void;
  initializeKnowledgeBaseControl(): void;
  initializeCommentForm(url: string): Promise<void>;
}
