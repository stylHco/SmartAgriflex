/**
 * List of keys in resolve/data dictionaries that, if 404d will send the user to the
 * 404 page. If the ApiResult is not found, but they key is not in this list, user
 * will be sent to internal error instead.
 *
 * Value must be an array of strings
 */
export const PRESENT_404_KEY = '__PRESENT_404';

/**
 * List of keys in resolve/data dictionaries that will have the automatic
 * redirections to error pages disabled.
 *
 * Value must be an array of strings
 */
export const IGNORE_API_ERRORS_KEY = '__IGNORE_API_ERRORS';

/**
 * Specify this in route data to disable the automatic API error checking
 * mechanism.
 *
 * Value must be SuppressApiErrorHandlingMode
 */
export const SUPPRESS_API_ERROR_HANDLING_KEY = '__SUPPRESS_API_ERROR_HANDLING';

export enum SuppressApiErrorHandlingMode {
  /**
   * No suppression (default).
   */
  None,

  /**
   * The resolved data of this route won't be checked (equivalent to
   * specifying `IGNORE_API_ERRORS_KEY` with all resolve keys).
   */
  Local,

  /**
   * The entire route tree won't be checked at all. Useful for error pages
   * like 404 to avoid accidentally creating endless redirects.
   */
  Full,
}
