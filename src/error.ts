export class Error400 extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Error400';
  }
}

export class Error401 extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Error401';
  }
}

export class Error403 extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Error403';
  }
}
