import {InlineLoader, Translation} from "@ngneat/transloco/lib/types";
import {ADDITIONAL_LANGS, DEFAULT_LANG} from "../app-constants";

export function createTranslocoLoader(
  defaultLangLoader: () => Promise<Translation>,
  additionalLangsLoaders: (lang: string) => Promise<Translation>,
): InlineLoader {
  const translocoLoader: InlineLoader = {};

  translocoLoader[DEFAULT_LANG] = defaultLangLoader;

  for (let lang of ADDITIONAL_LANGS) {
    translocoLoader[lang] = async () => {
      try {
        return await additionalLangsLoaders(lang);
      } catch (e) {
        console.error('Failed to load translations for ' + lang, e);
        return {};
      }
    };
  }

  return translocoLoader;
}
