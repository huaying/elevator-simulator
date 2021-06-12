export default class Request {
  public floor: number;
  public destFloor: number;

  constructor(floor: number, destFloor: number) {
    this.floor = floor;
    this.destFloor = destFloor;
  }

  public toString() {
    return `${this.floor + 1} -> ${this.destFloor + 1}`;
  }
}
