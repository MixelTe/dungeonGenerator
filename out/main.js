import { Generator } from "./generator.js";
new Generator()
    // .setSeed(1818785)
    .setSize(200, 200)
    .setRoomMinSize(15)
    .setDivideK(0, 1)
    .setRoomMinSizeK(2)
    .setGap(4)
    .setRoadWidth(2, 4)
    // .setImproveConnectionsEnabled(false)
    .setSquareChance(0.5)
    .setMinImprovePercentOnConnectionsAdd(5)
    .setDisplay(true)
    .gen();
