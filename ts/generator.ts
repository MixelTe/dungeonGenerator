import * as Lib from "./littleLib.js";
import { addFrame, lastFrame } from "./display.js";
import { Room, Road, RoadPoint } from "./room.js";

export class Generator
{
	public rooms: Room[] = [];
	public roads: Road[] = [];
	private startW = 100;
	private startH = 100;
	private minRoomW = 15;
	private minRoomH = 15;
	private roomGap = 4;
	private roomRoadGap = 4;
	private squareChance = 1;
	private minK = 0;
	private maxK = 1;
	private sizeK = 1;
	private minW = 2;
	private maxW = 4;
	private roadC = false;
	private improveG = true;
	private bImproveK = 0.05;
	private k = 1;
	private roomP = Parity.any;
	private roadP = Parity.any;
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

	/**
	 * set bounds of world
	 * @param w width
	 * @param h height, may be omitted for square dimensions
	 */
	public setSize(w: number, h = -1)
	{
		if (w < 0) { console.error(`setSize: w=${w} < 0`); return this; }
		if (h < 0) { console.error(`setSize: h=${h} < 0`); return this; }
		this.startW = w;
		this.startH = h > 0 ? h : w;
		return this;
	}
	/**
	 * all values will be multiples of k
	 * @param k k: int >= 1
	 */
	public setMultiplicity(k: number)
	{
		const ik = Math.floor(k);
		if (ik != k) { console.error(`setMultiplicity: k is not int`); return this; }
		if (k < 1) { console.error(`setMultiplicity: k=${k} < 1`); return this; }
		this.k = k;
		return this;
	}
	/**
	 * all lengths will have a given parity when divided by a multiplicity factor
	 */
	public setParity(rooms: Parity, roads = Parity.any)
	{
		this.roomP = rooms;
		this.roadP = roads;
		return this;
	}
	/**
	 * set min size of resulting rooms
	 * @param w width
	 * @param h height, may be omitted for square dimensions
	 */
	public setRoomMinSize(w: number, h = -1)
	{
		if (w < 0) { console.error(`setRoomMinSize: w=${w} < 0`); return this; }
		this.minRoomW = w;
		this.minRoomH = h > 0 ? h : w;
		return this;
	}
	/**
	 * set multiplier for the minimum room size to get random larger rooms
	 * @param sizeK sizeK >= 1
	 */
	public setRoomMinSizeK(sizeK: number)
	{
		if (sizeK < 1) { console.error(`setRoomMinSizeK: sizeK=${sizeK} < 1`); return this; }
		this.sizeK = sizeK;
		return this;
	}
	/**
	 * if 1 rooms will be always shrinked to squares
	 * if 0 rooms will be never shrinked to squares
	 * @param square
	 */
	public setSquareChance(squareChance: number)
	{
		this.squareChance = squareChance;
		return this;
	}
	/**
	 * set minimum gaps between rooms
	 * @param gap gap >= 0
	 */
	public setGap(gap: number)
	{
		if (gap < 0) { console.error(`setGap: gap=${gap} < 0`); return this; }
		this.roomGap = gap;
		return this;
	}
	/**
	 * set minimum gaps between room edge and road
	 * @param gap gap >= 0
	 */
	public setRoomRoadGap(gap: number)
	{
		if (gap < 0) { console.error(`setRoomRoadGap: gap=${gap} < 0`); return this; }
		this.roomRoadGap = gap;
		return this;
	}
	/**
	 * set min and max division factor of the room
	 * @param minK 0 <= minK <= 1
	 * @param maxK 0 <= maxK <= 1
	 */
	public setDivideK(minK: number, maxK: number)
	{
		if (minK < 0 || minK > 1) { console.error(`setDivideK: minK=${minK} not in [0, 1]`); return this; }
		if (maxK < 0 || maxK > 1) { console.error(`setDivideK: maxK=${maxK} not in [0, 1]`); return this; }
		if (minK > maxK) { console.error(`setDivideK: minK > maxK (${minK} > ${maxK})`); return this; }
		this.minK = minK;
		this.maxK = maxK;
		return this;
	}
	/**
	 * set min and max road width between rooms
	 * @param minK 0 <= minK <= 1
	 * @param maxK 0 <= maxK <= 1
	 */
	public setRoadWidth(minW: number, maxW: number)
	{
		if (minW < 0) { console.error(`setRoadWidth: minW=${minW} < 0`); return this; }
		if (maxW < 0) { console.error(`setRoadWidth: maxW=${maxW} < 0`); return this; }
		if (minW > maxW) { console.error(`setRoadWidth: minW > maxW (${minW} > ${maxW})`); return this; }
		this.minW = minW;
		this.maxW = maxW;
		return this;
	}
	public setRoadAlwaysFromRoomCenter(enabled: boolean)
	{
		this.roadC = enabled;
		return this;
	}
	public setImproveConnectionsEnabled(enabled: boolean)
	{
		this.improveG = enabled;
		return this;
	}
	/**
	 * set min percentage of distance reduction between all rooms when adding connections
	 * @param k 1 <= k <= 100
	 */
	public setMinImprovePercentOnConnectionsAdd(k: number)
	{
		if (k < 1 || k > 100) { console.error(`setMinImprovePercentOnConnectionsAdd: k=${k} not in [1, 100]`); return this; }
		this.bImproveK = k / 100;
		return this;
	}

	public setDisplay(display_split: boolean)
	{
		this.display_split = display_split;
		return this;
	}

	public async gen()
	{
		if (this.minW > this.roomGap)
		{
			console.warn("Road min width is greater then gap between rooms");
		}
		this.rooms = [new Room(0, 0, this.startW, this.startH)];
		await addFrame(this.rooms, this.roads, "Create dungeon", 1);

		while (this.splitRoom())
		{
			if (this.display_split) await addFrame(this.rooms, this.roads, "Divide room", 1);
		}
		if (!this.display_split) await addFrame(this.rooms, this.roads, "Rooms created", 1);

		this.shrinkRooms();
		await addFrame(this.rooms, this.roads, "Add gaps", 1);

		if (this.k > 1)
		{
			this.sizesToK();
			await addFrame(this.rooms, this.roads, "Multiplicity", 1);
		}
		if (this.squareChance > 0)
		{
			this.squareRooms();
			if (this.k > 1) this.sizesToK();
			await addFrame(this.rooms, this.roads, "Square rooms", 1);
		}
		await addFrame(this.rooms, this.roads, "Creating graph", 2);
		const graph = this.reconnectByPrimsAlgorithm()
		await addFrame(this.rooms, this.roads, "Applying the Prim algorithm", 2);
		if (this.improveG) await this.beautifyGraph(graph);
		this.buildRoads();
		await addFrame(this.rooms, this.roads, "Creating roads", 3);
		this.beautifyRoads();
		await addFrame(this.rooms, this.roads, "Road alignment", 3);
		await addFrame(this.rooms, this.roads, "Beautiful rendering", 4);
		lastFrame();
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
					if (room1.intersectsY(r))
					{
						room1.r.push(r);
						r.l.push(room1);
					}
					if (room2.intersectsY(r))
					{
						room2.r.push(r);
						r.l.push(room2);
					}
				})
				room.l.forEach(r =>
				{
					if (room1.intersectsY(r))
					{
						room1.l.push(r);
						r.r.push(room1);
					}
					if (room2.intersectsY(r))
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
				if (room1.intersectsX(r))
				{
					room1.t.push(r);
					r.b.push(room1);
				}
				if (room2.intersectsX(r))
				{
					room2.t.push(r);
					r.b.push(room2);
				}
			})
			room.b.forEach(r =>
			{
				if (room1.intersectsX(r))
				{
					room1.b.push(r);
					r.t.push(room1);
				}
				if (room2.intersectsX(r))
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
		return room.w >= (this.minRoomW + this.k) * (2 + k) + this.roomGap * 4 ||
			room.h >= (this.minRoomH + this.k) * (2 + k) + this.roomGap * 4;
		// return this.roomCanBeXSplited(room) || this.roomCanBeYSplited(room);
	}
	private roomCanBeXSplited(room: Room)
	{
		return room.w >= (this.minRoomW + this.k) * 2 + this.roomGap * 4;
	}
	private roomCanBeYSplited(room: Room)
	{
		return room.h >= (this.minRoomH + this.k) * 2 + this.roomGap * 4;
	}

	private splitSide(side: number, min: number)
	{
		min += (this.roomGap + this.k) * 2;
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
			if (this.squareChance != 1 && this.rnd() > this.squareChance) return;
			room.c = room.copy();
			const size = Math.min(room.w, room.h);
			room.x += Lib.randomInt(0, room.w - size, this.rnd);
			room.y += Lib.randomInt(0, room.h - size, this.rnd);
			room.w = size;
			room.h = size;
		});
	}

	private toK(v: number, min = 0, parity = Parity.any)
	{
		if (this.k == 1) return Math.floor(v);
		let vk = Math.floor(v / this.k);
		if (parity == Parity.even) vk -= vk % 2;
		else if (parity == Parity.odd) vk -= (1 - vk % 2);
		return Math.max(min, vk) * this.k;
	}
	private sizesToK()
	{
		this.rooms.forEach(room =>
		{
			room.x = this.toK(room.x);
			room.y = this.toK(room.y);
			room.w = this.toK(room.w, 0, this.roomP);
			room.h = this.toK(room.h, 0, this.roomP);
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

	private async beautifyGraph(graph: GraphNode[])
	{
		// console.time()
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

			const improve = (1 - minLen / len);
			// console.log(improve * 100);
			if (improve < this.bImproveK) break;
			if (minVarI >= 0)
			{
				const v = variants[minVarI];
				variants.splice(minVarI, 1);
				for (let i = variants.length - 1; i >= 0; i--)
				{
					const vi = variants[i];
					if (vi.r1 == v.r1 || vi.r1 == v.r2 ||
						vi.r2 == v.r1 || vi.r2 == v.r2
					)
						variants.splice(i, 1);
				}
				const { side1, side2 } = getSidesByVar(v);
				side1.push(v.r2.r);
				side2.push(v.r1.r);
			}
			await addFrame(this.rooms, this.roads, "Adding connections", 2);
		}
		// console.timeEnd()
		this.rooms.forEach(r =>
		{
			r.rooms.t = r.t[0] ?? null;
			r.rooms.r = r.r[0] ?? null;
			r.rooms.b = r.b[0] ?? null;
			r.rooms.l = r.l[0] ?? null;
		})
	}

	private graphDistance(_graph: GraphNode[], fromI: number, toI: number)
	{
		const graph = _graph.map(g => ({ ...g, d: 0 }));
		if (fromI == toI) return 0;

		let paths = graph[fromI].r.connections().map(c => ({ fromI, toI: graph.findIndex(r => r.r == c) }));
		let pathsNext: { fromI: number, toI: number }[] = [];

		while (paths.length > 0)
		{
			for (let i = 0; i < paths.length; i++)
			{
				const { fromI, toI } = paths[i];
				const from = graph[fromI];
				const to = graph[toI];
				const d = from.d + from.r.distance(to.r);
				if (to.d != 0 && d >= to.d) continue;
				to.d = d;
				to.r.connections().forEach(c => pathsNext.push({ fromI: toI, toI: graph.findIndex(r => r.r == c) }));
			}
			[paths, pathsNext] = [pathsNext, paths];
			pathsNext = [];
		}
		return graph[toI].d;
	}

	private buildRoads()
	{
		const connections: { f: Room, t: Room }[] = [];
		this.rooms.forEach(r =>
		{
			r.connections().forEach(cr =>
			{
				if (connections.find(c => c.f == cr && c.t == r)) return;
				connections.push({ f: r, t: cr });
			});
		});
		const road = (f: Room, t: Room) =>
		{
			let r;
			if (f.t.includes(t)) r = [
				new RoadPoint(f.x + Math.floor(f.w / 2), f.y, f),
				new RoadPoint(f.x + Math.floor(f.w / 2), f.c.y - this.roomGap)
			]
			else if (f.r.includes(t)) r = [
				new RoadPoint(f.x + f.w, f.y + Math.floor(f.h / 2), f),
				new RoadPoint(f.c.x + f.c.w + this.roomGap, f.y + Math.floor(f.h / 2))
			]
			else if (f.b.includes(t)) r = [
				new RoadPoint(f.x + Math.floor(f.w / 2), f.y + f.h, f),
				new RoadPoint(f.x + Math.floor(f.w / 2), f.c.y + f.c.h + this.roomGap)
			]
			else r = [
				new RoadPoint(f.x, f.y + Math.floor(f.h / 2), f),
				new RoadPoint(f.c.x - this.roomGap, f.y + Math.floor(f.h / 2))
			]
			return r;
		}
		this.roads = connections.map(c =>
		{
			const start = road(c.f, c.t);
			const end = road(c.t, c.f).reverse();
			const h = c.f.r.includes(c.t) || c.f.l.includes(c.t);
			if (h) end[0].x = start[1].x;
			else end[0].y = start[1].y;
			const r = new Road(this.toK(this.minW, 1), h, [...start, ...end]);
			if (c.f.t.includes(c.t))
			{
				c.f.roads.t = r;
				c.t.roads.b = r;
			}
			else if (c.f.r.includes(c.t))
			{
				c.f.roads.r = r;
				c.t.roads.l = r;
			}
			else if (c.f.b.includes(c.t))
			{
				c.f.roads.b = r;
				c.t.roads.t = r;
			}
			else
			{
				c.f.roads.l = r;
				c.t.roads.r = r;
			}
			return r;
		});
	}

	private beautifyRoads()
	{
		this.roads.forEach(road =>
		{
			const s = road.s;
			const e = road.e;
			if (!s.r || !e.r) return;
			const p = road.h ? "y" : "x";
			const l = road.h ? "h" : "w";
			const pn = road.h ? "x" : "y";
			const minG = this.toK(this.roomRoadGap);
			if (!this.roadC &&
				s.r[p] + s.r[l] - minG * 2 - road.w > e.r[p] &&
				e.r[p] + e.r[l] - minG * 2 - road.w > s.r[p]
			)
			{
				const minY = Math.max(s.r[p], e.r[p]) + minG;
				const maxY = Math.min(s.r[p] + s.r[l], e.r[p] + e.r[l]) - minG;
				if (maxY < minY) return;
				const meanY = Math.floor((s[p] + e[p]) / 2);
				const d = Math.min(this.maxW, maxY - minY) - road.w;
				const mink = this.roadP == Parity.even && road.w + d >= this.k * 2 ? 2 : 1;
				road.w = this.toK(road.w + Math.floor(d * this.rnd()), mink, this.roadP);
				const np = Lib.minmax(meanY, minY + road.w / 2, maxY - road.w / 2);
				const npl = this.toK(np - road.w / 2) + road.w / 2;
				s[p] = npl;
				e[p] = npl;
				road.p = [s, e];
			}
			else
			{
				const d = Math.min(this.maxW, this.roomGap, s.r[l] - minG * 2, e.r[l] - minG * 2) - road.w;
				const mink = this.roadP == Parity.even && road.w + d >= this.k * 2 ? 2 : 1;
				road.w = this.toK(road.w + Math.floor(d * this.rnd()), mink, this.roadP);
				const s2 = road.p[1];
				const e2 = road.p[2];
				s[p] = this.toK(s[p] - road.w / 2) + road.w / 2;
				s2[p] = s[p];
				e[p] = this.toK(e[p] - road.w / 2) + road.w / 2;
				e2[p] = e[p];
				const np = this.toK(s2[pn] - road.w / 2) + road.w / 2;
				s2[pn] = np;
				e2[pn] = np;
			}
		});
	}
}

type GraphNode = { o: Room, r: Room };

export enum Parity
{
	any,
	even,
	odd
}