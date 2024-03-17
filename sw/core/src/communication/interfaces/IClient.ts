import { IController, ControllerEventCallbacks } from './IController.js';
import { IPeripheral, PeripheralEventCallbacks } from './IPeripheral.js';

export type ClientEventCallbacks = ControllerEventCallbacks & PeripheralEventCallbacks;

export type IClient = IController & IPeripheral;
