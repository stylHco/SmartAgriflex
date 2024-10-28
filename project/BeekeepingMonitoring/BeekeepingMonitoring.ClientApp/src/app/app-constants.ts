import {InjectionToken} from "@angular/core";

///////////////////////
/// API interaction ///
///////////////////////

export const API_BASE = new InjectionToken<string>('__API_BASE', {
  providedIn: "root",
  factory: () => document.getElementsByTagName('base')[0].href + '_api/'
});

////////////////////
/// Localization ///
////////////////////

// If this is ever changed, make sure to update all calls to @transloco.helpers::createTranslocoLoader
export const DEFAULT_LANG = 'en';

export const ADDITIONAL_LANGS = ['gr', 'ru'];
