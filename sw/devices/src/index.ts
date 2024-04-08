export * from './typeUtils';

import Semaphore from './Semafor';
import Lantern from './Lantern';
import MockButton from './MockButton';
import { IDeviceType } from './typeUtils';

export const deviceTypes: Record<string, IDeviceType> = {
    [Semaphore.tag]: Semaphore,
    [Lantern.tag]: Lantern,
    [MockButton.tag]: MockButton,
};
