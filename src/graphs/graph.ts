import chartExporter from 'highcharts-export-server';
import fs from 'fs';

export const plotGraph = async (text: string, type: string, data: { x: number, y: number }[]) => {
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

    return new Promise(async (resolve, reject) => {
        chartExporter.export(chartDetails, async (err: Error, res: any) => {
            if (err) {
                reject(err);
            }
            let outputFile = "bar.png";
            let imageb64 = res.data;

            fs.writeFileSync(outputFile, imageb64, "base64");
            resolve('');
            // Get the image data (base64)
            //resolve(new Buffer.from(imageb64, 'base64'));
            //resolve(Buffer.from(imageb64, 'base64'));
            chartExporter.killPool();
        });
    });
}


