/// <reference path='../../typings/main.d.ts' />

import ImageFetcher from './imageFetcher';
import IImageFetcher from './IImageFetcher';
import restify = require('restify');
import fs = require('fs');

export default function imageHandler(request, response, next): void {
    let imageFetcher: IImageFetcher = new ImageFetcher();
    let imagePathSource: Rx.Observable<string>
        = imageFetcher.fetchImage(request.params.multiverseid);
    
    imagePathSource.subscribe((imagePath: string): void => {
        // TODO: Some type of caching needs to be put in place.
        let imgBytes = fs.readFileSync(imagePath);
        
        // TODO: Add content-type generator.
        response.contentType = 'image/png';
        response.writeHead(200);
        response.end(imgBytes);
        next();
    },
    () => {},
    () => {});
}
