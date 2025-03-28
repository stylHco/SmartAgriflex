# `ngDoCheck` reasons

* Prevent "flip-flopping" while the loadable is being updated (especially for synchronous loads/errors)
* All template updates happen at the same time 
  * Avoids template execution during "logic phase" of a zone tick
  * Avoids the need for `_viewRef.markForCheck()` after `createEmbeddedView()`

# `_dirty` reasons

* Simplest way of avoiding extraneous `_viewRef.markForCheck()` calls

# `this.cd.markForCheck()` reasons

* Required for `ngDoCheck` to run when inside a `ChangeDetectionStrategy.OnPush` component
