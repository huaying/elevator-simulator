import { Direction, FloorNumber, ElevatorSpeed } from "./constatns";
import Request from "./Request";

type TriggerRerender = () => void;

/*
  LOOK Algorithm
*/

export default class Elevator {
  private curFloor: number = 0;
  private direction: Direction = Direction.IDLE;
  private floorRequestInfo: Request[][];
  private upHead: number | null = null;
  private downHead: number | null = null;
  private upStops: Set<number>;
  private downStops: Set<number>;

  constructor() {
    this.floorRequestInfo = new Array(FloorNumber).fill(null).map((_) => []);
    this.upStops = new Set();
    this.downStops = new Set();
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

  private addRequests(req: Request) {
    this.floorRequestInfo[req.floor].push(req);
    this.addStop(req.floor);
  }

  private addStop(floor: number) {
    if (this.curFloor < floor) {
      this.upStops.add(floor);
    } else if (this.curFloor > floor) {
      this.downStops.add(floor);
    }
  }

  private processRequest(floor: number) {
    if (this.floorRequestInfo[floor].length > 0) {
      this.floorRequestInfo[floor].forEach((req) => {
        this.addStop(req.destFloor);
      });
      this.floorRequestInfo[floor] = [];
    }
  }

  public request(req: Request, triggerRerender: TriggerRerender) {
    const floor = req.floor;
    const destFloor = req.destFloor;

    if (this.direction === Direction.IDLE) {
      if (this.curFloor > floor) {
        this.direction = Direction.DOWN;
        this.addRequests(req);
      } else if (this.curFloor < floor) {
        this.direction = Direction.UP;
        this.addRequests(req);
      } else if (floor !== destFloor) {
        this.direction =
          destFloor > this.curFloor ? Direction.UP : Direction.DOWN;
        this.addStop(destFloor);
      }
      setTimeout(() => this.step(triggerRerender), ElevatorSpeed);
    } else {
      this.addRequests(req);
    }
  }

  public step(triggerRerender: TriggerRerender) {
    if (this.direction === Direction.UP) {
      this.curFloor += 1;
      this.processRequest(this.curFloor);
      this.upStops.delete(this.curFloor);
      if (this.upStops.size === 0) {
        this.direction =
          this.downStops.size === 0 ? Direction.IDLE : Direction.DOWN;
      }
    } else if (this.direction === Direction.DOWN) {
      this.curFloor -= 1;
      this.processRequest(this.curFloor);
      this.downStops.delete(this.curFloor);
      if (this.downStops.size === 0) {
        this.direction =
          this.upStops.size === 0 ? Direction.IDLE : Direction.UP;
      }
    }

    if (this.direction !== Direction.IDLE) {
      setTimeout(() => this.step(triggerRerender), ElevatorSpeed);
    }

    triggerRerender();
  }
}
