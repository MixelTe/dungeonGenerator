import * as Lib from "./littleLib.js";
import { Tilemap, TILES } from "./tilemap.js";
const canvas = Lib.getCanvas("canvas");
const ctx = Lib.canvas.getContext2d(canvas);
const display_cur = Lib.getEl("display_cur", HTMLSpanElement);
const title = Lib.getEl("title", HTMLHeadingElement);
const loader = Lib.getDiv("loader");
Lib.canvas.fitToParent(canvas);
const frames = [];
const tilemap = new Tilemap(4);
tilemap.load();
let curFrame = 0;
Lib.addButtonListener("btn_prev", () => {
    if (curFrame > 0)
        curFrame--;
    update();
});
Lib.addButtonListener("btn_next", () => {
    if (curFrame < frames.length - 1)
        curFrame++;
    update();
});
Lib.addButtonListener("btn_first", () => {
    curFrame = 0;
    update();
});
Lib.addButtonListener("btn_last", () => {
    curFrame = frames.length - 1;
    update();
});
window.addEventListener("keydown", e => {
    if (e.key == "ArrowRight") {
        if (curFrame < frames.length - 1)
            curFrame++;
        update();
    }
    else if (e.key == "ArrowLeft") {
        if (curFrame > 0)
            curFrame--;
        update();
    }
});
function update(draw = true) {
    display_cur.innerText = `${curFrame + 1}/${frames.length}`;
    title.innerText = frames[curFrame].title || "";
    if (draw)
        frames[curFrame]?.draw();
}
export async function addFrame(rooms, roads, title, displayMode = 0) {
    if (frames.length != 0 && curFrame == frames.length - 1)
        curFrame++;
    frames.push(new Frame(rooms, roads, title, displayMode));
    update(curFrame == frames.length - 1);
    await new Promise(r => setTimeout(r));
}
export function lastFrame() {
    loader.classList.add("loader-hide");
}
class Frame {
    title;
    displayMode;
    rooms;
    roads;
    bounds = { x: 0, y: 0, w: 0, h: 0 };
    constructor(rooms, roads, title, displayMode) {
        this.title = title;
        this.displayMode = displayMode;
        this.rooms = rooms.map(room => room.copy());
        this.roads = roads.map(road => road.copy());
        this.findBounds();
    }
    draw() {
        Lib.canvas.fitToParent(canvas);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        const minScale = Math.min(canvas.width / this.bounds.w, canvas.height / this.bounds.h);
        ctx.translate(-(this.bounds.w * minScale - canvas.width) / 2, -(this.bounds.h * minScale - canvas.height) / 2);
        ctx.scale(minScale, minScale);
        ctx.translate(-this.bounds.x, -this.bounds.y);
        if (this.displayMode == 4)
            this.beautyDraw();
        else
            this.commonDraw(minScale);
        ctx.restore();
    }
    commonDraw(scale) {
        ctx.fillStyle = "lightgreen";
        this.rooms.forEach((room, i) => {
            ctx.fillStyle = "lightgreen";
            fillRect(room);
            ctx.fillStyle = "black";
            ctx.fillText(`${i}`, room.x, room.y + 10);
        });
        this.rooms.forEach((room, i) => {
            ctx.strokeStyle = "violet";
            ctx.lineWidth = 2.5 / scale;
            strokeRect(room);
            if (this.displayMode != 1 && this.displayMode != 2)
                return;
            const cx = room.x + room.w / 2;
            const cy = room.y + room.h / 2;
            ctx.lineWidth = 1.5 / scale;
            ctx.strokeStyle = "green";
            const d = 5;
            const k = 0.75;
            const rnd = Lib.randomWithSeed(room.x * room.y);
            [[room.t, [0, 1]], [room.r, [-1, 0]], [room.b, [0, -1]], [room.l, [1, 0]]].forEach(v => {
                const [side, [dx, dy]] = v;
                side.forEach(r => {
                    ctx.beginPath();
                    if (this.displayMode == 1) {
                        ctx.moveTo(cx + dx * -k * room.w / 2 + dy * Lib.randomInt(0, d, rnd), cy + dy * -k * room.h / 2 + dx * Lib.randomInt(0, d, rnd));
                        ctx.lineTo(r.x + r.w / 2 + dx * k * r.w / 2 + dy * Lib.randomInt(0, d, rnd), r.y + r.h / 2 + dy * k * r.h / 2 + dx * Lib.randomInt(0, d, rnd));
                        ctx.lineTo(r.x + r.w / 2 + dx * k * r.w / 2 + dy, r.y + r.h / 2 + dy * k * r.h / 2 + dx);
                    }
                    else if (this.displayMode == 2) {
                        ctx.moveTo(cx, cy);
                        ctx.lineTo(r.x + r.w / 2, r.y + r.h / 2);
                    }
                    ctx.stroke();
                });
            });
        });
        this.roads.forEach((r, i) => {
            ctx.lineWidth = r.w;
            ctx.strokeStyle = "blue";
            ctx.beginPath();
            ctx.moveTo(r.p[0].x, r.p[0].y);
            for (let i = 1; i < r.p.length; i++) {
                const p = r.p[i];
                ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
            ctx.fillStyle = "orange";
            ctx.fillText(`${i}`, r.p[0].x, r.p[0].y);
        });
    }
    beautyDraw() {
        // ctx.scale(4, 4);
        ctx.fillStyle = "#222222";
        fillRect(this.bounds);
        this.rooms.forEach((room, i) => {
            ctx.fillStyle = "#483b3a";
            fillRect(room);
            tilemap.fillRect(ctx, TILES.floor, room);
            tilemap.draw(ctx, TILES.wall_top_left, room.x, room.y);
            tilemap.draw(ctx, TILES.wall_top_right, room.x + room.w - tilemap.tileSize, room.y);
            tilemap.draw(ctx, TILES.wall_bottom_left, room.x, room.y + room.h - tilemap.tileSize);
            tilemap.draw(ctx, TILES.wall_bottom_right, room.x + room.w - tilemap.tileSize, room.y + room.h - tilemap.tileSize);
            tilemap.fillRect(ctx, TILES.wall_top, room.x + tilemap.tileSize, room.y, room.w - tilemap.tileSize * 2, tilemap.tileSize);
            tilemap.fillRect(ctx, TILES.wall_right, room.x + room.w - tilemap.tileSize, room.y + tilemap.tileSize, tilemap.tileSize, room.h - tilemap.tileSize * 2);
            tilemap.fillRect(ctx, TILES.wall_bottom, room.x + tilemap.tileSize, room.y + room.h - tilemap.tileSize, room.w - tilemap.tileSize * 2, tilemap.tileSize);
            tilemap.fillRect(ctx, TILES.wall_left, room.x, room.y + tilemap.tileSize, tilemap.tileSize, room.h - tilemap.tileSize * 2);
        });
        this.roads.forEach(r => {
            const tile = TILES.floor;
            // const tile = TILES.dev1;
            if (r.p.length == 2) {
                const x1 = Math.min(r.p[0].x, r.p[1].x);
                const x2 = Math.max(r.p[0].x, r.p[1].x);
                const y1 = Math.min(r.p[0].y, r.p[1].y);
                const y2 = Math.max(r.p[0].y, r.p[1].y);
                if (r.h)
                    tilemap.fillRect(ctx, tile, x1, y1 - r.w / 2, x2 - x1, r.w);
                else
                    tilemap.fillRect(ctx, tile, x1 - r.w / 2, y1, r.w, y2 - y1);
            }
            else if (r.p.length == 4) {
                const { x: x1, y: y1 } = r.p[0];
                const { x: x2, y: y2 } = r.p[1];
                const { x: x3, y: y3 } = r.p[2];
                const { x: x4, y: y4 } = r.p[3];
                if (r.h) {
                    const dx1 = x2 > x1 ? 0 : r.w / 2;
                    tilemap.fillRect(ctx, tile, Math.min(x1, x2) + dx1, y1 - r.w / 2, Math.abs(x2 - x1) - r.w / 2, r.w);
                    tilemap.fillRect(ctx, tile, x2 - r.w / 2, Math.min(y2, y3) - r.w / 2, r.w, Math.abs(y2 - y3) + r.w);
                    const dx2 = x3 > x4 ? 0 : r.w / 2;
                    tilemap.fillRect(ctx, tile, Math.min(x4, x3) + dx2, y4 - r.w / 2, Math.abs(x3 - x4) - r.w / 2, r.w);
                }
                else {
                    const dy1 = y2 > y1 ? 0 : r.w / 2;
                    tilemap.fillRect(ctx, tile, x1 - r.w / 2, Math.min(y1, y2) + dy1, r.w, Math.abs(y1 - y2) - r.w / 2);
                    tilemap.fillRect(ctx, tile, Math.min(x2, x3) - r.w / 2, y2 - r.w / 2, Math.abs(x2 - x3) + r.w, r.w);
                    const dy2 = y3 > y4 ? 0 : r.w / 2;
                    tilemap.fillRect(ctx, tile, x4 - r.w / 2, Math.min(y4, y3) + dy2, r.w, Math.abs(y4 - y3) - r.w / 2);
                }
            }
            else {
                console.error("unsupported road path");
            }
        });
    }
    findBounds() {
        const r0 = this.rooms[0];
        let x1 = r0.x ?? 0;
        let y1 = r0.y ?? 0;
        let x2 = r0.x ?? 0 + r0.w ?? 0;
        let y2 = r0.y ?? 0 + r0.h ?? 0;
        this.rooms.forEach(room => {
            if (room.x < x1)
                x1 = room.x;
            if (room.y < y1)
                y1 = room.y;
            if (room.x + room.w > x2)
                x2 = room.x + room.w;
            if (room.y + room.h > y2)
                y2 = room.y + room.h;
        });
        this.bounds = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
        // if (this.displayMode == 4)
        {
            const b = Math.floor(this.bounds.w * 0.03);
            this.bounds.x -= b;
            this.bounds.y -= b;
            this.bounds.w += b * 2;
            this.bounds.h += b * 2;
        }
    }
}
function fillRect(rect) {
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
}
function strokeRect(rect) {
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
}
