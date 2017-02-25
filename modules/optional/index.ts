export interface Optional<T> {
    /**
     * Map the value to another type if present.
     */
    map<U>(fn: (input: T) => U): Optional<U>;

    /**
     * Unwrap the value if present, or provide another value instead.
     */
    orElse(provided: T): T;

    /**
     * Unwrap the value if present, or supply another value instead.
     */
    orElseGet(supplier: () => T): T;

    /**
     * Run the given consumer if the value is present.
     */
    ifPresent(consumer: (value: T) => void): void;
};

export function of<T>(value: T): Optional<T> {
    return new Present<T>(value);
}

export function absent<T>(): Optional<T> {
    return new Absent<T>();
}

class Present<T> implements Optional<T> {
    readonly value: T;

    constructor(value: T) {
        this.value = value;
    }

    public map<U>(fn: (input: T) => U) {
        return new Present<U>(fn(this.value));
    }

    public orElse(_value: T): T {
        return this.value;
    }

    public orElseGet(_supplier: () => T): T {
        return this.value;
    }

    public ifPresent(consumer: (value: T) => void): void {
        consumer(this.value);
    }
}

class Absent<T> implements Optional<T> {
    public map<U>(_fn: (input: T) => U): Optional<U> {
        return this as any as Absent<U>;
    }

    public orElse(provided: T): T {
        return provided;
    }

    public orElseGet(supplier: () => T): T {
        return supplier();
    }

    public ifPresent(_consumer: (value: T) => void): void {
        /* do nothing */
    }
}