import React from "react";
import { Direction, ElevatorNumber, FloorNumber } from "./constatns";
import Elevator from "./Elevator";
import Request from "./Request";

interface Props {}
interface State {
  requestFloor: string;
  requestDestination: string;
}

const ElevatorStyles = ["🟧", "🟨", "🟥", "🟫", "🟩", "🟦"];

export default class ElevatorSystem extends React.Component<Props, State> {
  private elevators: Elevator[];
  private requestQueue: Request[];

  state = {
    requestFloor: "1",
    requestDestination: "4"
  };

  constructor(props: Props) {
    super(props);
    this.elevators = [];
    for (let i = 0; i < ElevatorNumber; i++) {
      this.elevators.push(new Elevator());
    }
    this.requestQueue = [];
    this.processRequestQueue();
  }

  /*
    Scheduling Algorithm
    1. Find the idle one at the requested floor
    2. Find the cloest one. Prefer the moving one toward the requested floor 
       than the idle one
    3. Put the request in the queue and wait 
  */
  private findElevator(req: Request) {
    const floor = req.floor;
    const destFloor = req.destFloor;

    // 1
    for (let elevator of this.elevators) {
      if (
        elevator.getDirection() === Direction.IDLE &&
        elevator.getCurFloor() === floor
      ) {
        return elevator;
      }
    }

    // 2
    const getElevatorsWithSameDirectionOrIdle = this.elevators.filter(
      (elevator) => {
        const hasSameDirection =
          (elevator.getDirection() === Direction.UP &&
            elevator.getCurFloor() < floor &&
            floor < destFloor) ||
          (elevator.getDirection() === Direction.DOWN &&
            elevator.getCurFloor() > floor &&
            floor > destFloor);
        const isIdle = elevator.getDirection() === Direction.IDLE;
        return hasSameDirection || isIdle;
      }
    );

    if (getElevatorsWithSameDirectionOrIdle.length > 0) {
      const minFloorDiff = Math.min(
        ...getElevatorsWithSameDirectionOrIdle.map((elevator) =>
          Math.abs(elevator.getCurFloor() - floor)
        )
      );

      const elevator = getElevatorsWithSameDirectionOrIdle.find(
        (elevator) => Math.abs(elevator.getCurFloor() - floor) === minFloorDiff
      );

      if (elevator) {
        return elevator;
      }
    }

    // 3 return null and then the req will be put into the queue
    return null;
  }

  private addNewRequest = () => {
    const floor = parseInt(this.state.requestFloor, 10) - 1;
    const destFloor = parseInt(this.state.requestDestination, 10) - 1;

    this.requestQueue.push(new Request(floor, destFloor));
  };

  private processRequestQueue = () => {
    // TODO: requests from the same floor and having the same direction
    // can be aggregated
    if (this.requestQueue.length > 0) {
      const newQueue: Request[] = [];
      this.requestQueue.forEach((req) => {
        const elevator = this.findElevator(req);
        if (elevator) {
          elevator.request(req, this.triggerRerender);
        } else {
          newQueue.push(req);
        }
      });
      this.requestQueue = newQueue;
    }
    setTimeout(this.processRequestQueue, 100);
  };

  /* 
    methods below are for display 
  */

  private triggerRerender = () => {
    this.forceUpdate();
  };

  private handleRequestFloorChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    this.setState({ requestFloor: event.target.value });
  };

  private handleRequestDestinationChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    this.setState({ requestDestination: event.target.value });
  };

  render() {
    return (
      <div className="p-5">
        <div className="flex">
          {this.elevators.map((elevator, elevatorId) => (
            <div className="ml-10">
              {new Array(FloorNumber).fill(0).map((_, idx) => (
                <div key={idx} className="text-3xl">
                  {elevator.getCurFloor() === FloorNumber - idx - 1
                    ? ElevatorStyles[elevatorId % ElevatorStyles.length]
                    : "⬜️"}
                  {FloorNumber - idx}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-5 p-3 border-solid border-4">
          <div className="mt-1">
            Floor{" "}
            <input
              className="ml-1 pl-2 bg-gray-200"
              onChange={this.handleRequestFloorChange}
              value={this.state.requestFloor}
            />
          </div>
          <div className="mt-1">
            Destination{" "}
            <input
              className="ml-1 pl-2 bg-gray-200"
              onChange={this.handleRequestDestinationChange}
              value={this.state.requestDestination}
            />
          </div>
          <button
            className="mt-3 bg-gray-200 px-3 py-2 rounded"
            onClick={() => this.addNewRequest()}
          >
            Request
          </button>
        </div>

        <div className="mt-5 p-3 border-solid border-4">
          {this.requestQueue.length > 0 && (
            <div>
              Request Queue:{" "}
              {this.requestQueue.map((req) => req.toString()).join(", ")}
            </div>
          )}
          {this.elevators.map((elevator, idx) => (
            <div className="mb-1">
              Elevator: {idx + 1}
              <div className="ml-5">{elevator.getRequestInfo()}</div>
              {elevator.getDirection() === Direction.IDLE && (
                <div className="ml-5">Idle at {elevator.getCurFloor() + 1}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
}
