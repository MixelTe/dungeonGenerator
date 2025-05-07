import { Generator } from "./generator.js";
import * as Lib from "./littleLib.js";

new Generator()
	// .setSeed(1806971)
	.setSize(200, 200)
	.setRoomMinSize(20)
	.setRoomMinSizeK(2)
	// .setSquareChance(0.5)
	.setGap(4)
	.setDivideK(0, 1)
	.setRoadWidth(2, 4)
	// .setRoadAlwaysFromRoomCenter(true)
	// .setImproveConnectionsEnabled(false)
	.setMinImprovePercentOnConnectionsAdd(5)
	.setDisplay(true)
	.gen();

