import chartExporter from "highcharts-export-server";
import { workerData, parentPort, isMainThread } from 'worker_threads';


//export const plotGraph = async (text,type, data) => {
let { type, text, data } = workerData;
chartExporter.initPool();
console.log(isMainThread)
// Chart details object specifies chart type and data to plot
const chartDetails = {
    type: "png",
    options: {
        chart: {
            type
        },
        title: {
            text
        },
        plotOptions: {
            line: {
                dataLabels: {
                    enabled: true,
                    format: "<b>{point.x}</b>: {point.y}"
                }
            }
        },
        series: [
            {
                data
            }
        ]
    }
};


chartExporter.export(chartDetails, async (err, res) => {
    if (err) {
        reject(err);
    }
    // Get the image data (base64)
    let imageb64 = res.data;
    parentPort.postMessage(new Buffer.from(imageb64, 'base64'));
});

