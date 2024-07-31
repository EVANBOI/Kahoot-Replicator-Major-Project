export class BadRequest extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Error400';
  }
}

export class Unauthorised extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Error401';
  }
}

export class Forbidden extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Error403';
  }
}
