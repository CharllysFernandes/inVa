/**
 * Features Adapter - Clean Code
 */

import type { FeatureInitializer } from "../../domain/use-cases/content-use-cases";
import {
  initializeActivityMessageMonitor,
  initializeCommentForm,
  initializeCustomerUsernameMonitor,
  initializeKnowledgeBaseControl,
} from "@content/features";

export class FeaturesAdapter implements FeatureInitializer {
  initializeActivityMonitor(): void {
    initializeActivityMessageMonitor();
  }

  initializeCustomerValidation(): void {
    initializeCustomerUsernameMonitor();
  }

  initializeKnowledgeBaseControl(): void {
    initializeKnowledgeBaseControl();
  }

  async initializeCommentForm(url: string): Promise<void> {
    await initializeCommentForm(url);
  }
}
