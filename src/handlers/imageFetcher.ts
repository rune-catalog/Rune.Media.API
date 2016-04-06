/// <reference path='../../typings/main.d.ts' />

let async = require('async');
let request = require('request');
import fs = require('fs');
import IImageFetcher from './IImageFetcher';

const jpegRegExp: RegExp = /jpeg|jpg/i;
const pngRegExp: RegExp = /png/i;

interface IImageResult {
    imageFilePath: string;
    imageContentType: string;
}

export default class ImageFetcher implements IImageFetcher {
    static ImagePath: string = '/tmp/images/';

    private getFileInformation(path): fs.Stats {
        try {
            return fs.statSync(path);
        } catch (exception) {
            return null;
        }
    }

    private generateGenericImagePath(): string {
        return `${ImageFetcher.ImagePath}back.jpg`;
    }

    private getFilePath(multiverseId): string {
        if (!multiverseId) {
            return this.generateGenericImagePath();
        }

        let pngPath: string = `${ImageFetcher.ImagePath}${multiverseId}.png`;
        let jpgPath: string = `${ImageFetcher.ImagePath}${multiverseId}.jpg`;
        let pngFileStat: fs.Stats = this.getFileInformation(pngPath);
        let jpgFileStat: fs.Stats = this.getFileInformation(jpgPath);

        if (!pngFileStat && !jpgFileStat) {
            return null;
        }

        return pngFileStat.isFile()
            ? pngPath
            : jpgPath;
    }

    private fetchImageFromGatherer(multiverseId): void {
        async.waterfall([
            function(callback) {
                request(`http://gatherer.wizards.com/Handlers/image.ashx?multiverseid=${multiverseId}&type=card`,
                        { encoding: 'binary' },
                    function(error, response, body) {
                        callback(null, body, response.headers['content-type']);
                    });
            },
            function(imageBytes, contentType, callback) {
                let fileName = multiverseId;

                if (jpegRegExp.test(contentType)) {
                    fileName += '.png';
                } else if (pngRegExp.test(contentType)) {
                    fileName += '.jpg';
                }

                fs.writeFile(ImageFetcher.ImagePath + fileName, imageBytes, 'binary', function() {
                    callback(null, fileName);
                });
            }
        ], function(error, results) {
            console.log('complete');
        });
    }

    fetchImage(multiverseId: string): string {
        let existingImagePath: string = this.getFilePath(multiverseId);
        if (!existingImagePath) {
            this.fetchImageFromGatherer(multiverseId);
            existingImagePath = this.getFilePath(multiverseId);
        }
        
        return !!existingImagePath
            ? existingImagePath
            : this.generateGenericImagePath();
    } 
}
