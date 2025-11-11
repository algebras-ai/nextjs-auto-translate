import https from "https";
import http from "http";

export interface AlgebrasTranslationOptions {
  apiKey: string;
  apiBaseUrl?: string;
  batchSize?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface BatchTranslationRequest {
  sourceLanguage: string;
  targetLanguage: string;
  texts: string[];
}

export interface BatchTranslationResponse {
  translations: string[];
}

export class AlgebrasTranslationService {
  private apiKey: string;
  private apiBaseUrl: string;
  private batchSize: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(options: AlgebrasTranslationOptions) {
    this.apiKey = options.apiKey;
    this.apiBaseUrl =
      options.apiBaseUrl || "https://platform.algebras.ai/api/v1";
    this.batchSize = options.batchSize || 50; // Translate up to 50 texts per batch
    this.retryAttempts = options.retryAttempts || 3;
    this.retryDelay = options.retryDelay || 1000; // 1 second
  }

  /**
   * Translate a single text string
   */
  async translate(text: string, targetLocale: string, sourceLocale: string = "en"): Promise<string> {
    const result = await this.translateBatch([text], targetLocale, sourceLocale);
    return result[0];
  }

  /**
   * Translate multiple texts in a single batch request
   */
  async translateBatch(
    texts: string[],
    targetLocale: string,
    sourceLocale: string = "en"
  ): Promise<string[]> {
    // If source and target are the same, no translation needed
    if (sourceLocale === targetLocale) {
      return texts;
    }

    // If batch is larger than batchSize, split into multiple requests
    if (texts.length > this.batchSize) {
      const results: string[] = [];
      for (let i = 0; i < texts.length; i += this.batchSize) {
        const batch = texts.slice(i, i + this.batchSize);
        const batchResults = await this.translateBatch(
          batch,
          targetLocale,
          sourceLocale
        );
        results.push(...batchResults);
      }
      return results;
    }

    const requestBody: BatchTranslationRequest = {
      sourceLanguage: sourceLocale,
      targetLanguage: targetLocale,
      texts: texts,
    };

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(
          `[AlgebrasTranslationService] Translating ${texts.length} texts from ${sourceLocale} to ${targetLocale} (attempt ${attempt}/${this.retryAttempts})`
        );

        const response = await this.makeRequest(requestBody);
        
        console.log(
          `[AlgebrasTranslationService] Successfully translated ${response.translations.length} texts`
        );

        return response.translations;
      } catch (error) {
        console.warn(
          `[AlgebrasTranslationService] Translation attempt ${attempt} failed:`,
          error instanceof Error ? error.message : String(error)
        );

        if (attempt < this.retryAttempts) {
          // Wait before retrying
          await new Promise((resolve) =>
            setTimeout(resolve, this.retryDelay * attempt)
          );
        } else {
          // All attempts failed, return original texts as fallback
          console.error(
            `[AlgebrasTranslationService] All ${this.retryAttempts} attempts failed. Returning original texts.`
          );
          return texts;
        }
      }
    }

    // Fallback (should never reach here due to the else block above)
    return texts;
  }

  /**
   * Make HTTP request to Algebras API
   */
  private makeRequest(
    requestBody: BatchTranslationRequest
  ): Promise<BatchTranslationResponse> {
    return new Promise((resolve, reject) => {
      const url = new URL("/translation/translate-batch", this.apiBaseUrl);
      const protocol = url.protocol === "https:" ? https : http;

      const postData = JSON.stringify(requestBody);

      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData),
          "X-Api-Key": this.apiKey,
        },
      };

      const req = protocol.request(options, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const response = JSON.parse(data) as BatchTranslationResponse;
              resolve(response);
            } catch (error) {
              reject(
                new Error(
                  `Failed to parse response: ${error instanceof Error ? error.message : String(error)}`
                )
              );
            }
          } else {
            reject(
              new Error(
                `API request failed with status ${res.statusCode}: ${data}`
              )
            );
          }
        });
      });

      req.on("error", (error) => {
        reject(new Error(`Network error: ${error.message}`));
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Translate all texts for multiple locales efficiently
   */
  async translateForMultipleLocales(
    texts: string[],
    targetLocales: string[],
    sourceLocale: string = "en"
  ): Promise<Record<string, string[]>> {
    const results: Record<string, string[]> = {};

    // Translate for each target locale
    for (const targetLocale of targetLocales) {
      results[targetLocale] = await this.translateBatch(
        texts,
        targetLocale,
        sourceLocale
      );
    }

    return results;
  }
}

