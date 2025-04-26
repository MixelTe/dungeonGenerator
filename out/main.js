import { Generator } from "./generator.js";
new Generator()
    // .setSeed(9628268)
    .setSize(200, 200)
    .setRoomMinSize(20)
    .setDivideK(0, 1)
    .setRoomMinSizeK(2)
    .setGap(4)
    .setRoadWidth(2, 4)
    .setMinImprovePercentOnConnectionsAdd(5)
    // .setDisplay(true, false)
    .setDisplay(true, true)
    .gen();
