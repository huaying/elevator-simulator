import { Direction, FloorNumber, ElevatorSpeed } from "./constatns";
import Request from "./Request";

type UpdateInfo = () => void;

/*
  LOOK Algorithm
*/

export default class Elevator {
  private curFloor: number = 0;
  private direction: Direction = Direction.IDLE;
  private floorRequestInfo: Request[][];
  private upHead: number | null = null;
  private downHead: number | null = null;

  constructor() {
    this.floorRequestInfo = new Array(FloorNumber).fill(null).map((_) => []);
  }

  public getCurFloor() {
    return this.curFloor;
  }

  public getDirection() {
    return this.direction;
  }

  public getGoToInfo() {
    if (this.direction === Direction.UP && this.upHead !== null) {
      return `Go up to ${this.upHead + 1}`;
    }

    if (this.direction === Direction.DOWN && this.downHead !== null) {
      return `Go up to ${this.downHead + 1}`;
    }

    return "";
  }

  public getRequestInfo() {
    const info = this.floorRequestInfo
      .flat()
      .map((req) => req.toString())
      .join(", ");
    return info ? `Request ${info}` : "";
  }

  private updateBound(floor: number) {
    if (this.curFloor < floor) {
      this.upHead = this.upHead ? Math.max(floor, this.upHead) : floor;
    } else if (this.curFloor > floor) {
      this.downHead = this.downHead ? Math.min(floor, this.downHead) : floor;
    }
  }

  private processRequest(floor: number) {
    if (this.floorRequestInfo[floor].length > 0) {
      this.floorRequestInfo[floor].forEach((req) => {
        this.updateBound(req.destFloor);
      });
      this.floorRequestInfo[floor] = [];
    }
  }

  public request(req: Request, updateInfo: UpdateInfo) {
    const floor = req.floor;
    const destFloor = req.destFloor;

    if (this.direction === Direction.IDLE) {
      if (this.curFloor > floor) {
        this.direction = Direction.DOWN;
        this.floorRequestInfo[floor].push(req);
        this.updateBound(floor);
      } else if (this.curFloor < floor) {
        this.direction = Direction.UP;
        this.floorRequestInfo[floor].push(req);
        this.updateBound(floor);
      } else if (floor !== destFloor) {
        this.direction =
          destFloor > this.curFloor ? Direction.UP : Direction.DOWN;
        this.updateBound(destFloor);
      }
      setTimeout(() => this.step(updateInfo), ElevatorSpeed);
    } else {
      this.floorRequestInfo[floor].push(req);
      this.updateBound(floor);
    }
  }

  public step(updateInfo: UpdateInfo) {
    if (this.direction === Direction.UP) {
      this.curFloor += 1;
      this.processRequest(this.curFloor);
      if (this.curFloor === this.upHead) {
        this.direction =
          this.downHead === null ? Direction.IDLE : Direction.DOWN;
        this.upHead = null;
      }
    } else if (this.direction === Direction.DOWN) {
      this.curFloor -= 1;
      this.processRequest(this.curFloor);
      if (this.curFloor === this.downHead) {
        this.direction = this.upHead === null ? Direction.IDLE : Direction.UP;
        this.downHead = null;
      }
    }

    updateInfo();

    if (this.direction !== Direction.IDLE) {
      setTimeout(() => this.step(updateInfo), ElevatorSpeed);
    }
  }
}
