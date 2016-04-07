/// <reference path='../../typings/main.d.ts' />

interface IImageFetcher {
    fetchImage(multiverseId: string): Rx.Observable<string>;
}

export default IImageFetcher;
