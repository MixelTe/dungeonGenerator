import { Generator } from "./generator.js";
import * as Lib from "./littleLib.js";

new Generator()
	// .setSeed(1247746)
	.setSize(200, 200)
	.setRoomMinSize(20)
	.setDivideK(0, 1)
	.setRoomMinSizeK(2)
	.setGap(4)
	.setRoadWidth(3, 4)
	// .setImproveConnectionsEnabled(false)
	// .setSquareChance(0.5)
	.setMinImprovePercentOnConnectionsAdd(5)
	// .setRoadAlwaysFromRoomCenter(true)
	.setDisplay(true)
	.gen();

