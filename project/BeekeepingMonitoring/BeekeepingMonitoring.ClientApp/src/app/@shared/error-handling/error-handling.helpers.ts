import {Router} from "@angular/router";
import {IS_INTERNAl_EXTRA_KEY} from "../utils/is-internal-navigation.resolver";

export function sendToInternalError(router: Router) {
  router.navigate(
    ['_internal/error'],
    {
      skipLocationChange: true,
      state: {
        [IS_INTERNAl_EXTRA_KEY]: true,
      },
    }
  );
}

export function sendToNotFound(router: Router) {
  router.navigate(
    ['/404'],
    {
      skipLocationChange: true,
    }
  );
}
