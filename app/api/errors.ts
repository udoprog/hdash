var errors: any[] = [];

interface Catcheable {
  catch(onError: (error: any) => void): this;
}

export function wrap<T extends Catcheable>(catchable: T): T {
  return catchable.catch(error => {
    errors.push(error);
    console.log('caught error', error);
    throw error;
  });
}