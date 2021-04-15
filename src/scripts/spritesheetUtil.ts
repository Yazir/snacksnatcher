import * as PIXI from 'pixi.js';

export const getFrames = ( address : string, frameCount : number) : PIXI.Texture[] => 
{
    const cache = PIXI.utils.TextureCache
    const keys = buildFrameKeys(address, frameCount)
    const textures = keys.map(key => cache[key])
    return textures;
}

export const getFrame = (address : string ) : PIXI.Texture => {
    const cache = PIXI.utils.TextureCache
    return cache[address]
}

const buildFrameKeys = (key: string, frameCount: number): Array<string> => 
{
    return Array.from(Array(frameCount).keys())
        .map(idx => `${key}${String(idx).padStart(2, '0')}`);
}