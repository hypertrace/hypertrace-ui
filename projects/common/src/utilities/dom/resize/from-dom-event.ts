import { Observable } from 'rxjs';

export const fromDomResize: (element: Element) => Observable<ClientRect> = (element: Element) =>
  new Observable(subscriber => {
    // tslint:disable-next-line: ban-ts-ignore
    // @ts-ignore
    const resizeObserver = new ResizeObserver(entries => {
      entries.forEach((entry: { target: Element; contentRect: ClientRect }) => {
        if (entry.target === element) {
          subscriber.next(entry.contentRect);
        }
      });
    });

    resizeObserver.observe(element);

    subscriber.next(element.getBoundingClientRect());

    return () => resizeObserver.disconnect();
  });
