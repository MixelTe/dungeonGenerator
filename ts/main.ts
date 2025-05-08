import { Generator, Parity } from "./generator.js";
import * as Lib from "./littleLib.js";

// new Generator()
// 	// .setSeed(6605771)
// 	.setSize(200, 200)
// 	// .setMultiplicity(4)
// 	// .setParity(Parity.even, Parity.even)
// 	.setRoomMinSize(20)
// 	.setRoomMinSizeK(1)
// 	// .setSquareChance(0.5)
// 	.setGap(4)
// 	.setRoomRoadGap(2)
// 	.setDivideK(0, 1)
// 	.setRoadWidth(2, 4)
// 	// .setRoadAlwaysFromRoomCenter(true)
// 	// .setImproveConnectionsEnabled(false)
// 	.setMinImprovePercentOnConnectionsAdd(5)
// 	.setDisplay(true)
// 	.gen();

new Generator()
	// .setSeed(7635299)
	.setSize(500, 500)
	.setMultiplicity(4)
	// .setParity(Parity.even, Parity.even)
	.setRoomMinSize(24)
	.setRoomMinSizeK(1)
	// .setSquareChance(0.5)
	.setGap(24)
	.setRoomRoadGap(4)
	.setDivideK(0, 1)
	.setRoadWidth(16, 23.9)
	// .setRoadAlwaysFromRoomCenter(true)
	// .setImproveConnectionsEnabled(false)
	.setMinImprovePercentOnConnectionsAdd(5)
	.setDisplay(true)
	.gen();

