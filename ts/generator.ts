import * as Lib from "./littleLib.js";
import { addFrame } from "./display.js";
import { Room } from "./room.js";

export class Generator
{
	public rooms: Room[] = [];
	private startW = 100;
	private startH = 100;
	private minRoomW = 15;
	private minRoomH = 15;
	private roomGap = 4;
	private square = true;
	private minK = 0;
	private maxK = 1;
	private sizeK = 1;
	private minW = 2;
	private maxW = 4;
	private display = false;
	private display_split = false;
	private rnd = Lib.randomWithSeed((() => { const r = Lib.randomInt(10000000); console.log(`r: ${r}`); return r; })());
	// private rnd = Lib.randomWithSeed(5515751);
	// private rnd = Math.random;

	public setSeed(seed: number)
	{
		console.log(`r: ${seed}`);
		this.rnd = Lib.randomWithSeed(seed);
		return this;
	}

	public setRoomMinSize(w: number, h: number)
	{
		this.minRoomW = w;
		this.minRoomH = h;
		return this;
	}

	public setRoomMinSizeK(sizeK: number)
	{
		this.sizeK = sizeK;
		return this;
	}

	public setSize(w: number, h: number)
	{
		this.startW = w;
		this.startH = h;
		return this;
	}

	public setSquare(square: boolean)
	{
		this.square = square;
		return this;
	}

	public setGap(gap: number)
	{
		this.roomGap = gap;
		return this;
	}

	public setDivideK(minK: number, maxK: number)
	{
		this.minK = minK;
		this.maxK = maxK;
		return this;
	}

	public setRoadWidth(minW: number, maxW: number)
	{
		this.minW = minW;
		this.maxW = maxW;
		return this;
	}

	public setDisplay(display: boolean, display_split = false)
	{
		this.display = display;
		this.display_split = display_split;
		return this;
	}

	public gen()
	{
		this.rooms = [new Room(0, 0, this.startW, this.startH)];
		if (this.display) addFrame(this.rooms, "Создание подземелья", 1);

		while (this.splitRoom())
		{
			if (this.display_split) addFrame(this.rooms, "Разделение комнат", 1);
		}
		if (this.display && !this.display_split) addFrame(this.rooms, "Комнаты созданы", 1);

		this.shrinkRooms();
		if (this.display) addFrame(this.rooms, "Добавление промежутков", 1);

		if (this.square)
		{
			this.squareRooms();
			if (this.display) addFrame(this.rooms, "Оквадрачивание комнат", 1);
		}
		if (this.display) addFrame(this.rooms, "Создание графа", 2);
		const graph = this.reconnectByPrimsAlgorithm()
		if (this.display) addFrame(this.rooms, "Применение алгоритма Прима", 2);
		this.beautifyGraph(graph);
	}

	private splitRoom()
	{
		const room = this.rooms.find(room => this.roomCanBeSplited(room));
		if (!room) return false;

		// const hor = (this.roomCanBeXSplited(room) && this.roomCanBeYSplited(room)) ? room.w > room.h : this.roomCanBeYSplited(room);
		// const hor = (this.roomCanBeXSplited(room) && this.roomCanBeYSplited(room)) ? this.rnd() < (room.h / (room.w + room.h)) : this.roomCanBeYSplited(room);
		const hor = (this.roomCanBeXSplited(room) && this.roomCanBeYSplited(room)) ? 0.5 < (room.h / (room.w + room.h)) : this.roomCanBeYSplited(room);

		const roomI = this.rooms.indexOf(room);
		this.rooms.splice(roomI, 1);

		const { room1, room2 } = (() =>
		{
			if (hor)
			{
				const h1 = this.splitSide(room.h, this.minRoomH);
				const room1 = new Room(room.x, room.y, room.w, h1);
				const room2 = new Room(room.x, room.y + h1, room.w, room.h - h1);
				room.t.forEach(r =>
				{
					const i = r.b.indexOf(room);
					if (i >= 0) r.b[i] = room1;
				})
				room.b.forEach(r =>
				{
					const i = r.t.indexOf(room);
					if (i >= 0) r.t[i] = room2;
				})
				room.l.forEach(r =>
				{
					const i = r.r.indexOf(room);
					if (i >= 0) r.r.splice(i, 1);
				})
				room.r.forEach(r =>
				{
					const i = r.l.indexOf(room);
					if (i >= 0) r.l.splice(i, 1);
				})
				room.r.forEach(r =>
				{
					if (room1.intersectsY(r, this.minW))
					{
						room1.r.push(r);
						r.l.push(room1);
					}
					if (room2.intersectsY(r, this.minW))
					{
						room2.r.push(r);
						r.l.push(room2);
					}
				})
				room.l.forEach(r =>
				{
					if (room1.intersectsY(r, this.minW))
					{
						room1.l.push(r);
						r.r.push(room1);
					}
					if (room2.intersectsY(r, this.minW))
					{
						room2.l.push(r);
						r.r.push(room2);
					}
				})
				room1.t = room.t;
				room1.b.push(room2);
				room2.t.push(room1);
				room2.b = room.b;
				return { room1, room2 };
			}
			const w1 = this.splitSide(room.w, this.minRoomW);
			const room1 = new Room(room.x, room.y, w1, room.h);
			const room2 = new Room(room.x + w1, room.y, room.w - w1, room.h);
			room.t.forEach(r =>
			{
				const i = r.b.indexOf(room);
				if (i >= 0) r.b.splice(i, 1);
			})
			room.b.forEach(r =>
			{
				const i = r.t.indexOf(room);
				if (i >= 0) r.t.splice(i, 1);
			})
			room.r.forEach(r =>
			{
				const i = r.l.indexOf(room);
				if (i >= 0) r.l[i] = room2;
			})
			room.l.forEach(r =>
			{
				const i = r.r.indexOf(room);
				if (i >= 0) r.r[i] = room1;
			})
			room.t.forEach(r =>
			{
				if (room1.intersectsX(r, this.minW))
				{
					room1.t.push(r);
					r.b.push(room1);
				}
				if (room2.intersectsX(r, this.minW))
				{
					room2.t.push(r);
					r.b.push(room2);
				}
			})
			room.b.forEach(r =>
			{
				if (room1.intersectsX(r, this.minW))
				{
					room1.b.push(r);
					r.t.push(room1);
				}
				if (room2.intersectsX(r, this.minW))
				{
					room2.b.push(r);
					r.t.push(room2);
				}
			})
			room1.r.push(room2);
			room1.l = room.l;
			room2.r = room.r;
			room2.l.push(room1);
			return { room1, room2 };
		})();

		this.rooms.push(room1);
		this.rooms.push(room2);

		return true;
	}

	private roomCanBeSplited(room: Room)
	{
		const k = this.rnd() * this.sizeK;
		return room.w >= this.minRoomW * (2 + k) + this.roomGap * 4 ||
			room.h >= this.minRoomH * (2 + k) + this.roomGap * 4;
		// return this.roomCanBeXSplited(room) || this.roomCanBeYSplited(room);
	}
	private roomCanBeXSplited(room: Room)
	{
		return room.w >= this.minRoomW * 2 + this.roomGap * 4;
	}
	private roomCanBeYSplited(room: Room)
	{
		return room.h >= this.minRoomH * 2 + this.roomGap * 4;
	}

	private splitSide(side: number, min: number)
	{
		min += this.roomGap * 2;
		const d = side - min * 2;
		const k = this.rnd() * (this.maxK - this.minK) + this.minK;
		return min + Math.floor(d * k);
	}

	private shrinkRooms()
	{
		this.rooms.forEach(room =>
		{
			room.x += this.roomGap;
			room.y += this.roomGap;
			room.w -= this.roomGap * 2;
			room.h -= this.roomGap * 2;
		});
	}

	private squareRooms()
	{
		this.rooms.forEach(room =>
		{
			const size = Math.min(room.w, room.h);
			room.x += Lib.randomInt(0, room.w - size, this.rnd);
			room.y += Lib.randomInt(0, room.h - size, this.rnd);
			room.w = size;
			room.h = size;
		});
	}

	private reconnectByPrimsAlgorithm()
	{
		const r = Lib.chooseRandom(this.rooms, this.rnd);
		this.rooms.splice(this.rooms.indexOf(r), 1);
		const graph = [{ o: r, r: r.copy(false) }];
		while (this.rooms.length > 0)
		{
			const next: { r: Room, gr: GraphNode, d: number }[] = [];
			for (let i = 0; i < this.rooms.length; i++)
			{
				const room = this.rooms[i];
				for (const groom of graph)
				{
					if (groom.o.hasConnection(room))
					{
						next.push({ r: room, gr: groom, d: room.distance(groom.o) });
					}
				}
			}
			next.sort((a, b) => a.d - b.d);
			if (next.length == 0) break;
			const { r, gr: { o: go, r: gr } } = next[0];
			const nr = r.copy(false);
			if (go.t.includes(r))
			{
				gr.t.push(nr);
				nr.b.push(gr);
				go.t.forEach(r2 => r2.b.includes(go) && r2.b.splice(r2.b.indexOf(go), 1));
				r.b.forEach(r2 => r2.t.includes(r) && r2.t.splice(r2.t.indexOf(r), 1));
				go.t = [];
				r.b = [];
			}
			if (go.b.includes(r))
			{
				gr.b.push(nr);
				nr.t.push(gr);
				go.b.forEach(r2 => r2.t.includes(go) && r2.t.splice(r2.t.indexOf(go), 1));
				r.t.forEach(r2 => r2.b.includes(r) && r2.b.splice(r2.b.indexOf(r), 1));
				go.b = [];
				r.t = [];
			}
			if (go.r.includes(r))
			{
				gr.r.push(nr);
				nr.l.push(gr);
				go.r.forEach(r2 => r2.l.includes(go) && r2.l.splice(r2.l.indexOf(go), 1));
				r.l.forEach(r2 => r2.r.includes(r) && r2.r.splice(r2.r.indexOf(r), 1));
				go.r = [];
				r.l = [];
			}
			if (go.l.includes(r))
			{
				gr.l.push(nr);
				nr.r.push(gr);
				go.l.forEach(r2 => r2.r.includes(go) && r2.r.splice(r2.r.indexOf(go), 1));
				r.r.forEach(r2 => r2.l.includes(r) && r2.l.splice(r2.l.indexOf(r), 1));
				go.l = [];
				r.r = [];
			}
			graph.push({ o: r, r: nr });
			this.rooms.splice(this.rooms.indexOf(r), 1);
		}
		this.rooms = graph.map(r => r.r);
		return graph;
	}

	private beautifyGraph(graph: GraphNode[])
	{
		console.time()
		const variants = graph.reduce((pv, v) =>
		{
			[{ s: v.o.t, n: "t" }, { s: v.o.r, n: "r" }, { s: v.o.b, n: "b" }, { s: v.o.l, n: "l" }].forEach(({ s, n }) =>
			{
				for (let i = 0; i < s.length; i++)
				{
					const r2 = graph.find(r => r.o == s[i]);
					if (!r2) continue;
					if (pv.find(r => r.r1 == r2)) continue;
					pv.push({ r1: v, r2, n });
				}
			})
			return pv;
		}, [] as { r1: GraphNode, r2: GraphNode, n: string }[]);
		const graphLen = () =>
		{
			let distanceSum = 0;
			for (let fromI = 0; fromI < graph.length; fromI++)
				for (let toI = 0; toI < graph.length; toI++)
					distanceSum += this.graphDistance(graph, fromI, toI)
			return distanceSum;
		}
		const getSidesByVar = (v: { r1: GraphNode, r2: GraphNode, n: string }) =>
		{
			const { r1, r2, n } = v;
			return {
				side1: n == "t" ? r1.r.t : n == "r" ? r1.r.r : n == "b" ? r1.r.b : r1.r.l,
				side2: n == "t" ? r2.r.b : n == "r" ? r2.r.l : n == "b" ? r2.r.t : r2.r.r,
			}
		}
		console.log(variants);
		while (variants.length > 0)
		{
			const len = graphLen();
			let minLen = len;
			let minVarI = -1;
			for (let i = 0; i < variants.length; i++)
			{
				const v = variants[i];
				const { side1, side2 } = getSidesByVar(v);
				side1.push(v.r2.r);
				side2.push(v.r1.r);
				const newLen = graphLen();
				if (newLen < minLen)
				{
					minLen = newLen;
					minVarI = i;
				}
				side1.pop();
				side2.pop();
			}
			if (minVarI >= 0)
			{
				const v = variants[minVarI];
				variants.splice(minVarI, 1);
				const { side1, side2 } = getSidesByVar(v);
				side1.push(v.r2.r);
				side2.push(v.r1.r);
			}

			const improve = (1 - minLen / len);
			this.rooms = graph.map(r => r.r);
			if (this.display) addFrame(this.rooms, "Добавление соединений", 2);
			console.log(improve * 100);
			if (improve < 0.05) break;
		}
		console.timeEnd()
	}

	private graphDistance(graph: GraphNode[], fromI: number, toI: number, path: number[] = [])
	{
		if (fromI == toI) return 0;
		path.push(fromI);
		// console.log(path);
		const from = graph[fromI]
		const connections = from.r.connections();
		let distance = -1;
		for (let i = 0; i < connections.length; i++)
		{
			const nextI = graph.findIndex(r => r.r == connections[i]);
			if (path.includes(nextI)) continue;
			const d = from.r.distance(graph[nextI].r);
			const gd = this.graphDistance(graph, nextI, toI, path);
			if (gd >= 0)
			{
				if (distance < 0) distance = d + gd;
				else distance = Math.min(distance, d + gd);
			}
		}
		path.pop();
		return distance;
	}
}

type GraphNode = { o: Room, r: Room };