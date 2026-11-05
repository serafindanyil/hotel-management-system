import { InvalidEmailError } from './errors.js';

const AT_SIGN = '@';

export class Email {
  private constructor(readonly value: string) {}

  static of(raw: string): Email {
    const value = raw.trim().toLowerCase();
    if (!value.includes(AT_SIGN)) throw new InvalidEmailError();
    return new Email(value);
  }

  equals(other: Email | null): boolean {
    return other !== null && other.value === this.value;
  }
}
