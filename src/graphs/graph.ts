import chartExporter from 'highcharts-export-server';
import { sendMail } from '../mails/mail.js';

export const plotGraph = async (text: string, type: string, data: { x: number, y: number }[], email: string) => {
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
            let result = Buffer.from(res.data, 'base64');
            let attachments = [{
                filename: 'graph.png',
                content: result,
                contentType: 'image/png'
            }]
            sendMail(email, 'Report of Data', 'This report has data of last 10 values', attachments);
            resolve(result);
            chartExporter.killPool();
        });
    });
}


