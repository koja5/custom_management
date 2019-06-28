import { DefaultUrlSerializer, UrlSerializer, UrlTree } from '@angular/router';

export let appContants = {
    outlets: ['dashboard']
  };

export class StandardUrlSerializer implements UrlSerializer {
    private _defaultUrlSerializer: DefaultUrlSerializer = new DefaultUrlSerializer();

    parse(url: string): UrlTree {
        appContants.outlets.forEach(outletName => {
            const reg = new RegExp('/(' + outletName + ')/([^\/]*)');
            console.log(reg);
            url = url.replace(reg, '$1/($1:$2)' );
        });
        return this._defaultUrlSerializer.parse(url);
    }

    serialize(tree: UrlTree): string {
        let url = this._defaultUrlSerializer.serialize(tree);
        appContants.outlets.forEach(outletName => {
            const reg = new RegExp('\\(' + outletName + ':([^\/]*)\\)');
            console.log(url);
            url = url.replace(reg, '$1');
        });
        return url;
    }
}