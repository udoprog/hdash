type Cancelled = 'cancelled';

/**
 * Promise that can be cancelled.
 * 
 * Cancellation prevents the resolve method of the forwarded promise from being called.
 */
export default class Request<T> {
  public static CANCELLED: Cancelled = 'cancelled';

  private readonly promise: Promise<T>;
  private cancelled: boolean;

  constructor(promise: Promise<T>) {
    this.cancelled = false;

    this.promise = new Promise((resolve, reject) => {
      promise.then(value => this.cancelled ? reject(Request.CANCELLED) : resolve(value),
        reject)
    });
  }

  public then<U, E>(onresolve?: (value: T) => U, onfailure?: (error: Error) => E): Promise<U | E | Cancelled> {
    return this.promise.then(onresolve, onfailure);
  }

  public cancel(): void {
    this.cancelled = true;
  }

  static resolve(): Request<void>;
  static resolve<T>(value?: T): Request<T>;

  static resolve<T>(value?: T): Request<T> | Request<void> {
    if (!value) {
      return new Request<void>(Promise.resolve());
    }

    return new Request<T>(Promise.resolve(value));
  }

  static reject<T>(error: Error): Request<T | void> {
    return new Request<T>(Promise.reject(error));
  }
}