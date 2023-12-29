import MQTT from "async-mqtt";
import { config } from "dotenv";
import { Game } from "./game.js";

import * as process from "process";

interface Color {
    r: number
    g: number
    b: number
}

const Red: Color = {
    r: 255,
    g: 0,
    b: 0,
}

const White: Color = {
    r: 50,
    g: 50,
    b: 50,
}

const Black: Color = {
    r: 0,
    g: 0,
    b: 0,
}

const devices: Map<string, any> = new Map();

async function delay(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
}

async function sendCommand(client: MQTT.AsyncClient, device: string, command: string, data: any) {
    const msg = {
        command,
        data,
    }
    console.log(JSON.stringify(msg))
    await client.publish(`tet/devices/${device}/commands`, JSON.stringify(msg))
}

async function openDoor(client: MQTT.AsyncClient, device: string, door: number) {
    await sendCommand(client, device, 'openDoor', { index: door })
}

async function closeDoor(client: MQTT.AsyncClient, device: string, door: number) {
    await sendCommand(client, device, 'closeDoor', { index: door })
}

async function fillTop(client: MQTT.AsyncClient, device: string, color: Color) {
    await sendCommand(client, device, 'fillTop', { color })
}

async function shutdown(client: MQTT.AsyncClient, device: string) {
    await sendCommand(client, device, 'shutdown', {})
}

async function render(game: Game) {
    for (const [device, _] of devices) {
        for (let i = 0; i < 4; i++) {
            if (game.state.get(device)!) {
                await openDoor(client, device, i)
                await fillTop(client, device, White)
            } else {
                await closeDoor(client, device, i)
                await fillTop(client, device, Black)
            }
        }
    }
}

config();

if (!process.env.MQTT_HOST)
    throw new Error("MQTT_HOST not set");

const host = process.env.MQTT_HOST;

const client = await MQTT.connectAsync(host);

let game: Game | null = null

async function commandHandler(_message: Buffer): Promise<void> {
    const message = JSON.parse(_message.toString())
    switch (message.command) {
        case 'startGame':
            game = new Game(Array.from(devices.keys()))
            render(game)
            console.log('game started')
            break

        case 'shutdown':
            for (const device of devices.keys())
                await shutdown(client, device)
            break
    }
}

async function eventHandler(topic: string, _message: Buffer): Promise<void> {
    const levels = topic.split('/')
    const device = levels[2]
    const event = levels[4]
    console.log(`evetn: ${event}`)
    const data = JSON.parse(_message.toString())

    if (!game)
        return

    switch (event) {
        case 'btnPressed':
            game.toggle(device)
            render(game)
            break
    }
}

async function messageHandler(topic: string, message: Buffer): Promise<void> {
    console.log(topic, message.toString())
    const levels = topic.split('/')
    const last = levels.slice(-1)[0]
    console.log(last)
    if (last == 'commands')
        await commandHandler(message)
    else if (levels.slice(-2)[0] == 'events')
        await eventHandler(topic, message)
    else if (topic.startsWith('tet/devices')) {
        if (!devices.has(last))
            devices.set(last, message)
        shutdown(client, last)
        client.subscribe(`tet/devices/${last}/events/#`)
    } else
        console.error('unknown message')
}


console.log("Connected");

client.subscribe('tet/devices/+')
client.subscribe('tet/devices/controller/commands')
client.on("message", messageHandler)
