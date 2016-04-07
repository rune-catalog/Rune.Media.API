/// <reference path='../../typings/main.d.ts' />

//let Observable = require('rx').Observable;

interface IImageFetcher {
    fetchImage(multiverseId: string): Rx.Observable<string>;
}

export default IImageFetcher;
