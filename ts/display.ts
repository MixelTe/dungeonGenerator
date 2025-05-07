import * as Lib from "./littleLib.js";
import type { Road, Room } from "./room.js";
import { Tilemap, TILES } from "./tilemap.js";

const canvas = Lib.getCanvas("canvas");
const ctx = Lib.canvas.getContext2d(canvas);
const display_cur = Lib.getEl("display_cur", HTMLSpanElement);
const title = Lib.getEl("title", HTMLHeadingElement);
const loader = Lib.getDiv("loader");
Lib.canvas.fitToParent(canvas);

const frames: Frame[] = [];
const tilemap = new Tilemap();
tilemap.load();
const tileSize = 6;
let curFrame = 0;

Lib.addButtonListener("btn_prev", () =>
{
	if (curFrame > 0) curFrame--;
	update();
});
Lib.addButtonListener("btn_next", () =>
{
	if (curFrame < frames.length - 1) curFrame++;
	update();
});
Lib.addButtonListener("btn_first", () =>
{
	curFrame = 0;
	update();
});
Lib.addButtonListener("btn_last", () =>
{
	curFrame = frames.length - 1;
	update();
});
window.addEventListener("keydown", e =>
{
	if (e.key == "ArrowRight")
	{
		if (curFrame < frames.length - 1) curFrame++;
		update();
	}
	else if (e.key == "ArrowLeft")
	{
		if (curFrame > 0) curFrame--;
		update();
	}
})
function update(draw = true)
{
	display_cur.innerText = `${curFrame + 1}/${frames.length}`;
	title.innerText = frames[curFrame].title || "";
	if (draw) frames[curFrame]?.draw();
}

export async function addFrame(rooms: Room[], roads: Road[], title: string, displayMode = 0)
{
	if (frames.length != 0 && curFrame == frames.length - 1) curFrame++;
	frames.push(new Frame(rooms, roads, title, displayMode));
	update(curFrame == frames.length - 1);
	await new Promise(r => setTimeout(r));
}
export function lastFrame()
{
	loader.classList.add("loader-hide")
}


class Frame
{
	private rooms: Room[];
	private roads: Road[];
	private bounds = { x: 0, y: 0, w: 0, h: 0 };
	constructor(
		rooms: Room[],
		roads: Road[],
		public title: string,
		private displayMode: number,
	)
	{
		this.rooms = rooms.map(room => room.copy());
		this.roads = roads.map(road => road.copy());
		this.findBounds();
	}

	public draw()
	{
		Lib.canvas.fitToParent(canvas);
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.save();
		const minScale = Math.min(canvas.width / this.bounds.w, canvas.height / this.bounds.h);
		ctx.translate(-(this.bounds.w * minScale - canvas.width) / 2, -(this.bounds.h * minScale - canvas.height) / 2);
		ctx.scale(minScale, minScale);
		ctx.translate(-this.bounds.x, -this.bounds.y)
		if (this.displayMode == 4)
			this.beautyDraw(minScale);
		else
			this.commonDraw(minScale);
		ctx.restore();
	}

	private commonDraw(scale: number)
	{
		ctx.fillStyle = "lightgreen";
		this.rooms.forEach((room, i) =>
		{
			// ctx.fillStyle = "lightgreen";
			fillRect(room);
			// ctx.fillStyle = "black";
			// ctx.fillText(`${i}`, room.x, room.y + 10)
		});
		this.rooms.forEach((room, i) =>
		{
			ctx.strokeStyle = "violet";
			ctx.lineWidth = 2.5 / scale;
			strokeRect(room);
			if (this.displayMode != 1 && this.displayMode != 2) return;
			const cx = room.x + room.w / 2;
			const cy = room.y + room.h / 2;
			ctx.lineWidth = 1.5 / scale;
			ctx.strokeStyle = "green";
			const d = 5;
			const k = 0.75;
			const rnd = Lib.randomWithSeed(room.x * room.y);
			([[room.t, [0, 1]], [room.r, [-1, 0]], [room.b, [0, -1]], [room.l, [1, 0]]] as [Room[], [number, number]][]).forEach(v =>
			{
				const [side, [dx, dy]] = v;
				side.forEach(r =>
				{
					ctx.beginPath();
					if (this.displayMode == 1)
					{
						ctx.moveTo(cx + dx * -k * room.w / 2 + dy * Lib.randomInt(0, d, rnd), cy + dy * -k * room.h / 2 + dx * Lib.randomInt(0, d, rnd));
						ctx.lineTo(r.x + r.w / 2 + dx * k * r.w / 2 + dy * Lib.randomInt(0, d, rnd), r.y + r.h / 2 + dy * k * r.h / 2 + dx * Lib.randomInt(0, d, rnd));
						ctx.lineTo(r.x + r.w / 2 + dx * k * r.w / 2 + dy, r.y + r.h / 2 + dy * k * r.h / 2 + dx);
					}
					else if (this.displayMode == 2)
					{
						ctx.moveTo(cx, cy);
						ctx.lineTo(r.x + r.w / 2, r.y + r.h / 2);
					}
					ctx.stroke();
				});
			})
		});
		this.roads.forEach(r =>
		{
			ctx.lineWidth = r.w;
			ctx.strokeStyle = "blue";
			ctx.beginPath();
			ctx.moveTo(r.p[0].x, r.p[0].y);
			for (let i = 1; i < r.p.length; i++)
			{
				const p = r.p[i];
				ctx.lineTo(p.x, p.y);
			}
			ctx.stroke();
		});
	}

	private beautyDraw(scale: number)
	{
		ctx.fillStyle = "#222222";
		fillRect(this.bounds);
		this.rooms.forEach((room, i) =>
		{
			ctx.fillStyle = "#483b3a";
			fillRect(room);
			ctx.save();
			ctx.beginPath();
			ctx.rect(room.x, room.y, room.w, room.h);
			ctx.clip();
			for (let x = 0; x < room.w / tileSize; x++)
				for (let y = 0; y < room.h / tileSize; y++)
					tilemap.draw(ctx, TILES.floor, room.x + x * tileSize, room.y + y * tileSize, tileSize, tileSize);
			ctx.restore()
			ctx.strokeStyle = "#aa8d7a";
			ctx.lineWidth = 3 / scale;
			// strokeRect(room);
		});
		this.roads.forEach(r =>
		{
			ctx.lineWidth = r.w;
			ctx.strokeStyle = "#aa8d7a";
			ctx.beginPath();
			ctx.moveTo(r.p[0].x, r.p[0].y);
			for (let i = 1; i < r.p.length; i++)
			{
				const p = r.p[i];
				ctx.lineTo(p.x, p.y);
			}
			ctx.stroke();
		});
	}

	private findBounds()
	{
		const r0 = this.rooms[0];
		let x1 = r0.x ?? 0;
		let y1 = r0.y ?? 0;
		let x2 = r0.x ?? 0 + r0.w ?? 0;
		let y2 = r0.y ?? 0 + r0.h ?? 0;
		this.rooms.forEach(room =>
		{
			if (room.x < x1) x1 = room.x;
			if (room.y < y1) y1 = room.y;
			if (room.x + room.w > x2) x2 = room.x + room.w;
			if (room.y + room.h > y2) y2 = room.y + room.h;
		});
		this.bounds = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
		if (this.displayMode == 4)
		{
			const b = Math.floor(this.bounds.w * 0.03);
			this.bounds.x -= b;
			this.bounds.y -= b;
			this.bounds.w += b * 2;
			this.bounds.h += b * 2;
		}
	}
}

function fillRect(rect: { x: number, y: number, w: number, h: number })
{
	ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
}
function strokeRect(rect: { x: number, y: number, w: number, h: number })
{
	ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
}