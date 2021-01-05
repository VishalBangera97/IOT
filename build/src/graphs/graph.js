var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import chartExporter from 'highcharts-export-server';
export const plotGraph = (text, type, data) => __awaiter(void 0, void 0, void 0, function* () {
    chartExporter.initPool();
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
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        chartExporter.export(chartDetails, (err, res) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                reject(err);
            }
            // Get the image data (base64)
            let imageb64 = res.data;
            //resolve(new Buffer.from(imageb64, 'base64'));
            resolve(Buffer.from(imageb64, 'base64'));
        }));
    }));
});
