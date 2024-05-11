export * from './typeUtils.js';

import Semaphore from './Semafor.js';
import Lantern from './Lantern.js';
import MockButton from './MockButton.js';
import { IDeviceType } from './typeUtils.js';

export const deviceTypes: Record<string, IDeviceType> = {
    [Semaphore.tag]: Semaphore,
    [Lantern.tag]: Lantern,
    [MockButton.tag]: MockButton,
};
