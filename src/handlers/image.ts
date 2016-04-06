import ImageFetcher from './imageFetcher';
import IImageFetcher from './IImageFetcher';
import restify = require('restify');
import fs = require('fs');

export default function imageHandler(request, response, next): void {
    let imageFetcher: IImageFetcher = new ImageFetcher();
    let imagePath = imageFetcher.fetchImage(request.params.multiverseid);
    
    // TODO: Some type of caching needs to be put in place.
    let imgBytes = fs.readFileSync(imagePath);
    
    // TODO: Add content-type generator.
    response.contentType = 'image/png';
    response.writeHead(200);
    response.end(imgBytes);
    next();
}
