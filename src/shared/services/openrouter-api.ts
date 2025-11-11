/// <reference types="chrome" />

/**
 * Cliente da API do OpenRouter
 * Gerencia comunicação com a API de IA para geração de sugestões
 * @module openrouter-api
 */

import {
  getStoredOpenRouterConfig,
  type OpenRouterConfig,
} from "../core/utils";
import { logger } from "../core/logger";

/**
 * Interface para resposta de chat completion
 * @interface ChatCompletionResponse
 */
interface ChatCompletionResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Interface para mensagem de chat
 * @interface ChatMessage
 */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Interface para sugestões de perguntas
 * @interface QuestionSuggestions
 */
export interface QuestionSuggestions {
  questions: string[];
  context: string;
  timestamp: number;
}

/**
 * Cache de sugestões para evitar chamadas repetidas
 * @private
 */
const suggestionsCache = new Map<string, QuestionSuggestions>();

/**
 * TTL do cache em milissegundos (5 minutos)
 * @constant
 */
const CACHE_TTL_MS = 5 * 60 * 1000;

/**
 * Modelo padrão para usar na API
 * Usando Google Gemini Flash 1.5 (gratuito e rápido)
 * @constant
 */
const DEFAULT_MODEL = "openai/chatgpt-4o-latest";

/**
 * Limpa entradas expiradas do cache
 * @private
 */
function cleanExpiredCache(): void {
  const now = Date.now();
  for (const [key, value] of suggestionsCache.entries()) {
    if (now - value.timestamp > CACHE_TTL_MS) {
      suggestionsCache.delete(key);
      void logger.debug("openrouter", "Removed expired cache entry", { key });
    }
  }
}

/**
 * Gera hash simples de string para uso como chave de cache
 * @private
 * @param {string} text - Texto para gerar hash
 * @returns {string} Hash do texto
 */
function simpleHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Verifica se a configuração do OpenRouter está completa
 * @async
 * @returns {Promise<boolean>} True se configuração está válida
 */
export async function isConfigured(): Promise<boolean> {
  try {
    const config = await getStoredOpenRouterConfig();
    const hasApiKey = Boolean(config.apiKey && config.apiKey.length > 0);
    void logger.debug("openrouter", "Configuration check", { hasApiKey });
    return hasApiKey;
  } catch (e) {
    void logger.error("openrouter", "Failed to check configuration", {
      error: String(e),
    });
    return false;
  }
}

/**
 * Faz requisição de chat completion para a API do OpenRouter
 * Usa background script para evitar problemas de CSP
 * @async
 * @param {ChatMessage[]} messages - Array de mensagens do chat
 * @param {string} [model] - Modelo a ser usado (opcional)
 * @returns {Promise<ChatCompletionResponse>} Resposta da API
 * @throws {Error} Se configuração inválida ou erro na API
 */
export async function chatCompletion(
  messages: ChatMessage[],
  model: string = DEFAULT_MODEL
): Promise<ChatCompletionResponse> {
  const config = await getStoredOpenRouterConfig();

  if (!config.apiKey) {
    const error = new Error("OpenRouter API Key não configurada");
    void logger.error("openrouter", "API Key missing", {});
    throw error;
  }

  void logger.debug(
    "openrouter",
    "Sending chat completion request via background",
    {
      model,
      messageCount: messages.length,
    }
  );

  try {
    // Envia requisição para o background script
    void logger.debug("openrouter", "Calling chrome.runtime.sendMessage", {});

    const response = await chrome.runtime.sendMessage({
      type: "OPENROUTER_CHAT_COMPLETION",
      messages,
      model,
    });

    void logger.debug("openrouter", "Received response from background", {
      hasResponse: !!response,
      success: response?.success,
    });

    if (!response) {
      void logger.error("openrouter", "No response from background script", {});
      throw new Error(
        "Sem resposta do background script. Verifique se o service worker está ativo."
      );
    }

    if (!response.success) {
      void logger.error("openrouter", "API request failed", {
        error: response.error,
      });
      throw new Error(`OpenRouter API error: ${response.error}`);
    }

    const data = response.data as ChatCompletionResponse;
    void logger.info("openrouter", "Chat completion successful", {
      model: data.model,
      tokensUsed: data.usage?.total_tokens,
    });

    return data;
  } catch (e) {
    const error = e as Error;
    void logger.error("openrouter", "Chat completion request failed", {
      error: error.message,
      stack: error.stack,
    });
    throw e;
  }
}

/**
 * Gera perguntas complementares com base no texto do usuário
 * @async
 * @param {string} userText - Texto digitado pelo usuário
 * @param {boolean} [useCache=true] - Se deve usar cache
 * @returns {Promise<QuestionSuggestions>} Sugestões de perguntas
 */
export async function generateQuestions(
  userText: string,
  useCache: boolean = true
): Promise<QuestionSuggestions> {
  // Limpa texto e valida
  const cleanText = userText.trim();

  if (cleanText.length < 10) {
    void logger.debug("openrouter", "Text too short for suggestions", {
      length: cleanText.length,
    });
    return { questions: [], context: cleanText, timestamp: Date.now() };
  }

  // Verifica cache
  const cacheKey = simpleHash(cleanText);
  if (useCache && suggestionsCache.has(cacheKey)) {
    const cached = suggestionsCache.get(cacheKey)!;
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      void logger.debug("openrouter", "Returning cached suggestions", {
        questionCount: cached.questions.length,
      });
      return cached;
    }
  }

  // Limpa cache expirado
  cleanExpiredCache();

  // Monta prompt para IA
  const systemPrompt = `Você é um assistente especializado em suporte técnico N1. 
Sua função é analisar o relato inicial de um problema e sugerir perguntas complementares relevantes que ajudem o analista a coletar informações essenciais.

Regras:
1. Gere EXATAMENTE 3 perguntas complementares
2. As perguntas devem ser diretas, objetivas e relevantes
3. Priorize informações técnicas importantes (navegador, versão, mensagem de erro, etc.)
4. Evite perguntas já respondidas no texto original
5. Retorne APENAS um array JSON com as perguntas, sem texto adicional
6. Formato: ["Pergunta 1?", "Pergunta 2?", "Pergunta 3?"]`;

  const userPrompt = `Texto do analista:
"${cleanText}"

Gere 3 perguntas complementares relevantes em formato JSON.`;

  try {
    const response = await chatCompletion([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    const content = response.choices[0]?.message?.content || "[]";

    // Extrai JSON da resposta (pode vir com markdown)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const jsonString = jsonMatch ? jsonMatch[0] : "[]";

    let questions: string[] = [];
    try {
      questions = JSON.parse(jsonString) as string[];

      // Valida e filtra
      questions = questions
        .filter((q) => typeof q === "string" && q.trim().length > 0)
        .slice(0, 3); // Máximo 3 perguntas
    } catch (parseError) {
      void logger.error("openrouter", "Failed to parse questions JSON", {
        content,
        error: String(parseError),
      });
      questions = [];
    }

    const suggestions: QuestionSuggestions = {
      questions,
      context: cleanText,
      timestamp: Date.now(),
    };

    // Salva no cache
    if (questions.length > 0) {
      suggestionsCache.set(cacheKey, suggestions);
      void logger.info("openrouter", "Generated and cached questions", {
        questionCount: questions.length,
        cacheSize: suggestionsCache.size,
      });
    }

    return suggestions;
  } catch (e) {
    void logger.error("openrouter", "Failed to generate questions", {
      error: String(e),
    });
    return { questions: [], context: cleanText, timestamp: Date.now() };
  }
}

/**
 * Limpa o cache de sugestões
 * @returns {void}
 */
export function clearSuggestionsCache(): void {
  const size = suggestionsCache.size;
  suggestionsCache.clear();
  void logger.info("openrouter", "Suggestions cache cleared", {
    entriesCleared: size,
  });
}

/**
 * Obtém estatísticas do cache
 * @returns {Object} Estatísticas do cache
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: suggestionsCache.size,
    keys: Array.from(suggestionsCache.keys()),
  };
}
