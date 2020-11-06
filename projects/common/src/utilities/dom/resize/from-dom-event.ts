import ResizeObserver from 'resize-observer-polyfill';
import { Observable } from 'rxjs';

export const fromDomResize: (element: Element) => Observable<ClientRect> = (element: Element) =>
  new Observable(subscriber => {
    const resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        if (entry.target === element) {
          subscriber.next(entry.contentRect);
        }
      });
    });

    resizeObserver.observe(element);

    subscriber.next(element.getBoundingClientRect());

    return () => resizeObserver.disconnect();
  });
