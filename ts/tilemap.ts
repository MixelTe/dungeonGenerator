import * as Lib from "./littleLib.js";

export class Tilemap
{
	private img = new Image();
	private loaded = false;

	constructor(
		public tileSize = 1,
	) { }

	public load(small = false)
	{
		this.img.onload = () =>
		{
			this.loaded = true;
		};
		if (small)
			this.img.src = "imgs/tiles_small.png";
		else
			this.img.src = "imgs/tiles.png";
		// this.img.src = "imgs/tiles_dev.png";
	}

	public draw(ctx: CanvasRenderingContext2D, tile: TILES, x: number, y: number)
	{
		if (!this.loaded) return;
		let sx = 0;
		let sy = 0;
		switch (tile)
		{
			case TILES.floor: sx = Lib.randomInt(3); sy = Lib.randomInt(2); break;
			case TILES.dev1: sx = 0; sy = 2; break;
			case TILES.wall_top_left: sx = 3; sy = 0; break;
			case TILES.wall_top: sx = 4; sy = 0; break;
			case TILES.wall_top_right: sx = 5; sy = 0; break;
			case TILES.wall_right: sx = 5; sy = 1; break;
			case TILES.wall_bottom_right: sx = 5; sy = 2; break;
			case TILES.wall_bottom: sx = 4; sy = 2; break;
			case TILES.wall_bottom_left: sx = 3; sy = 2; break;
			case TILES.wall_left: sx = 3; sy = 1; break;
			case TILES.wall_bottom_left_outer: sx = 6; sy = 1; break;
			case TILES.wall_bottom_right_outer: sx = 7; sy = 1; break;
			case TILES.wall_top_left_outer: sx = 6; sy = 0; break;
			case TILES.wall_top_right_outer: sx = 7; sy = 0; break;

			default: throw new Error("switch default");
		}
		ctx.imageSmoothingEnabled = false;
		ctx.drawImage(this.img, sx * 16, sy * 16, 16, 16, x, y, this.tileSize, this.tileSize);
	}

	public fillRect(ctx: CanvasRenderingContext2D, tile: TILES, rect: { x: number, y: number, w: number, h: number }): void
	public fillRect(ctx: CanvasRenderingContext2D, tile: TILES, x: number, y: number, w: number, h: number): void
	public fillRect(ctx: CanvasRenderingContext2D, tile: TILES, x: number | { x: number, y: number, w: number, h: number }, y = 0, w = 0, h = 0): void
	{
		if (typeof x != "number")
		{
			y = x.y;
			w = x.w;
			h = x.h;
			x = x.x;
		}
		ctx.save();
		ctx.beginPath();
		ctx.rect(x, y, w, h);
		ctx.clip();
		for (let dx = 0; dx < w / this.tileSize; dx++)
			for (let dy = 0; dy < h / this.tileSize; dy++)
				this.draw(ctx, tile, x + dx * this.tileSize, y + dy * this.tileSize);
		ctx.restore()
	}
}

export enum TILES
{
	floor,
	dev1,
	wall_top_left,
	wall_bottom_left_outer,
	wall_top,
	wall_top_right,
	wall_bottom_right_outer,
	wall_right,
	wall_bottom_right,
	wall_top_right_outer,
	wall_bottom,
	wall_bottom_left,
	wall_top_left_outer,
	wall_left,
}