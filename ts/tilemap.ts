import * as Lib from "./littleLib.js";

export class Tilemap
{
	private img = new Image();
	private loaded = false;

	public load()
	{
		this.img.onload = () =>
		{
			this.loaded = true;
		};
		this.img.src = "imgs/tiles.png";
	}

	public draw(ctx: CanvasRenderingContext2D, tile: TILES, x: number, y: number, w: number, h: number)
	{
		if (!this.loaded) return;
		let sx = 0;
		let sy = 0;
		switch (tile)
		{
			case TILES.floor:
				sx = Lib.randomInt(3);
				sy = Lib.randomInt(2);
				break;

			default:
				throw new Error("switch default");
		}
		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(this.img, sx * 16, sy * 16, 16, 16, x, y, w, h);
	}
}

export enum TILES
{
	floor,
}