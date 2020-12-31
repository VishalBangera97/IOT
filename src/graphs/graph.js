import chartExporter from "highcharts-export-server";

export const plotGraph = async (text,type, data) => {

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
    return new Promise((resolve, reject) => {
        chartExporter.export(chartDetails, async (err, res) => {
            if (err) {
                reject('Error generating buffer for graph');
            }
            // Get the image data (base64)
            let imageb64 = res.data;
            resolve(new Buffer.from(imageb64, 'base64'));
        });

    });
}