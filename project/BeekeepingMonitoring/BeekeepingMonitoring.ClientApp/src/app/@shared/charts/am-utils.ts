import {Subject} from "rxjs";
import {Disposer, Root} from "@amcharts/amcharts5";

/**
 * Creates an rxjs Subject that will emit and complete when
 * the created am5 Disposer is disposed.
 */
export function createSubjectDisposer(): [Disposer, Subject<void>] {
  const subject = new Subject<void>();
  const disposer = new Disposer(() => {
    subject.next();
    subject.complete();
  });

  return [disposer, subject];
}

/**
 * Creates an rxjs Subject that will emit and complete when
 * the passed am5 root is disposed.
 */
export function createDisposeSubjectForRoot(root: Root): Subject<void> {
  const [disposer, subject] = createSubjectDisposer();

  root.addDisposer(disposer);
  return subject;
}
