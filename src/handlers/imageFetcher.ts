/// <reference path='../../typings/main.d.ts' />

let async = require('async');
let request = require('request');

import Rx = require('rx');
import fs = require('fs');
import IImageFetcher from './IImageFetcher';

const jpegRegExp: RegExp = /jpeg|jpg/i;
const pngRegExp: RegExp = /png/i;

export default class ImageFetcher implements IImageFetcher {
    // TODO: Determine how/where to pass this in.
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

    private fetchImageFromGatherer(multiverseId): Rx.Observable<void> {
        let observable: Rx.ReplaySubject<void> = new Rx.ReplaySubject<void>();

        async.waterfall([
            (callback) => {
                request(`http://gatherer.wizards.com/Handlers/image.ashx?multiverseid=${multiverseId}&type=card`,
                        { encoding: 'binary' },
                        (error, response, body) => {
                            callback(null, body, response.headers['content-type']);
                        }
                );
            },
            (imageBytes, contentType, callback) => {
                let fileName: string = multiverseId;

                if (jpegRegExp.test(contentType)) {
                    fileName += '.png';
                } else if (pngRegExp.test(contentType)) {
                    fileName += '.jpg';
                }

                fs.writeFile(`${ImageFetcher.ImagePath}${fileName}`,
                             imageBytes,
                             'binary',
                             () => {
                                callback(null, fileName);
                             }
                );
            }
        ], (error, results) => {
            observable.onCompleted();
        });

        return observable;
    }

    fetchImage(multiverseId: string): Rx.Observable<string> {
        let returnSource: Rx.ReplaySubject<string> = new Rx.ReplaySubject<string>();

        let existingImagePath: string = this.getFilePath(multiverseId);
        if (existingImagePath) {
            returnSource.onNext(existingImagePath);
            returnSource.onCompleted();
            return returnSource;
        }

        let fetchSource = this.fetchImageFromGatherer(multiverseId);
        fetchSource.subscribe(() => {}, () => {},
            () => {
                existingImagePath = this.getFilePath(multiverseId);
                returnSource.onNext(existingImagePath);
                returnSource.onCompleted();               
            });

        return returnSource;
    } 
}
