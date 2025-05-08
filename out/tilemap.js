import * as Lib from "./littleLib.js";
export class Tilemap {
    tileSize;
    img = new Image();
    loaded = false;
    constructor(tileSize = 4) {
        this.tileSize = tileSize;
    }
    load() {
        this.img.onload = () => {
            this.loaded = true;
        };
        this.img.src = "imgs/tiles.png";
        // this.img.src = "imgs/tiles_dev.png";
    }
    draw(ctx, tile, x, y) {
        if (!this.loaded)
            return;
        let sx = 0;
        let sy = 0;
        switch (tile) {
            case TILES.floor:
                sx = Lib.randomInt(3);
                sy = Lib.randomInt(2);
                break;
            case TILES.dev1:
                sx = 0;
                sy = 2;
                break;
            case TILES.wall_top_left:
                sx = 3;
                sy = 0;
                break;
            case TILES.wall_top:
                sx = 4;
                sy = 0;
                break;
            case TILES.wall_top_right:
                sx = 5;
                sy = 0;
                break;
            case TILES.wall_right:
                sx = 5;
                sy = 1;
                break;
            case TILES.wall_bottom_right:
                sx = 5;
                sy = 2;
                break;
            case TILES.wall_bottom:
                sx = 4;
                sy = 2;
                break;
            case TILES.wall_bottom_left:
                sx = 3;
                sy = 2;
                break;
            case TILES.wall_left:
                sx = 3;
                sy = 1;
                break;
            default: throw new Error("switch default");
        }
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.img, sx * 16, sy * 16, 16, 16, x, y, this.tileSize, this.tileSize);
    }
    fillRect(ctx, tile, x, y = 0, w = 0, h = 0) {
        if (typeof x != "number") {
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
        ctx.restore();
    }
}
export var TILES;
(function (TILES) {
    TILES[TILES["floor"] = 0] = "floor";
    TILES[TILES["dev1"] = 1] = "dev1";
    TILES[TILES["wall_top_left"] = 2] = "wall_top_left";
    TILES[TILES["wall_top"] = 3] = "wall_top";
    TILES[TILES["wall_top_right"] = 4] = "wall_top_right";
    TILES[TILES["wall_right"] = 5] = "wall_right";
    TILES[TILES["wall_bottom_right"] = 6] = "wall_bottom_right";
    TILES[TILES["wall_bottom"] = 7] = "wall_bottom";
    TILES[TILES["wall_bottom_left"] = 8] = "wall_bottom_left";
    TILES[TILES["wall_left"] = 9] = "wall_left";
})(TILES || (TILES = {}));
