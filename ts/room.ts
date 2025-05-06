export class Room
{
	public t: Room[] = [];
	public r: Room[] = [];
	public b: Room[] = [];
	public l: Room[] = [];
	public c: Room;  // container

	constructor(
		public x: number,
		public y: number,
		public w: number,
		public h: number,
	)
	{
		this.c = this;
	}

	public copy(d = true)
	{
		const room = new Room(this.x, this.y, this.w, this.h)
		room.c = this.c;
		if (d)
		{
			room.t = this.t.map(r => r.copy(false));
			room.r = this.r.map(r => r.copy(false));
			room.b = this.b.map(r => r.copy(false));
			room.l = this.l.map(r => r.copy(false));
		}
		return room;
	}

	public intersectsX(room: Room, minIntersection = 0)
	{
		return room.x + minIntersection < this.x + this.w && room.x + room.w - minIntersection > this.x;
	}

	public intersectsY(room: Room, minIntersection = 0)
	{
		return room.y + minIntersection < this.y + this.h && room.y + room.h - minIntersection > this.y;
	}

	public hasConnection(room: Room)
	{
		return this.t.includes(room) || this.r.includes(room) || this.b.includes(room) || this.l.includes(room);
	}

	public connections()
	{
		return this.t.concat(this.r).concat(this.b).concat(this.l);
	}

	public distance(room: Room)
	{
		// const dx = this.x + this.w / 2 - (room.x + room.w / 2);
		// const dy = this.y + this.h / 2 - (room.y + room.h / 2);
		// return Math.sqrt(dx * dx + dy * dy);
		const dx1 = this.x + this.w - room.x;
		const dy1 = this.y + this.h - room.y;
		const dx2 = this.x - (room.x + room.w);
		const dy2 = this.y - (room.y + room.h);
		const dx = Math.min(dx1, dx2);
		const dy = Math.min(dy1, dy2);
		// return Math.sqrt(dx * dx + dy * dy);
		return dx * dx + dy * dy;
		// return Math.abs(dx) + Math.abs(dy);
	}
}

export class Road
{
	constructor(
		public w: number,
		public h: boolean,
		public p: RoadPoint[],
	) { }

	public get s() { return this.p[0] };
	public get e() { return this.p[this.p.length - 1] };

	public copy()
	{
		const road = new Road(this.w, this.h, this.p.map(p => p.copy()));
		return road;
	}
}

export class RoadPoint
{
	constructor(
		public x: number,
		public y: number,
		public r: Room | null = null,
	) { }

	public copy()
	{
		return new RoadPoint(this.x, this.y, this.r);
	}
}
