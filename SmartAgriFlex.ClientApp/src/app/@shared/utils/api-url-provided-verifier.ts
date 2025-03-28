import {APP_INITIALIZER, inject, StaticProvider} from "@angular/core";
import {APP_API_BASE_URL} from "../../@core/app-api";

/**
 * Since NSwag-generated clients inject the API URL using @Optional() and then default to
 * wherever the API was when the client was generated (usually developer's localhost),
 * the clients can start silently calling completely incorrect URLs.
 *
 * In order to maintain compatibility with Angular Universal, the value is provided at
 * platform level (as it requires direct DOM access), so it's very easy to miss the
 * provider when creating a different platform
 */
export const ApiUrlProvidedVerifierProvider: StaticProvider = {
  provide: APP_INITIALIZER,
  useFactory: () => {
    try {
      inject(APP_API_BASE_URL);
    }
    catch (e) {
      console.error('Failed to resolve APP_API_BASE_URL. The app cannot function without it set - check platform providers');
      throw e;
    }

    return () => {};
  },
  multi: true,
};
