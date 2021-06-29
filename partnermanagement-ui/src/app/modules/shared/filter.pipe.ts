import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'searchFilter'
})

export class SearchFilter implements PipeTransform {

    transform(arr: any[], prop: string, value: string, method: Method): any {
        if (arr) {
            if (!value) {
                return arr;
            } else if (prop === '' || prop == null) {
                return arr.filter(item => this.filter(item.toString().toLowerCase(), value.toLowerCase(), method));
            } else {
                return arr.filter(obj => this.filter(obj[prop].toString().toLowerCase(), value.toLowerCase(), method));
            }
        } else {
            return [];
        }
    }

    filter(source: string, target: string, method: Method): boolean {

        switch (method) {
            case 'includes': return source.includes(target);
            case 'equal': return source === target;
            case 'not-equal': return source !== target;
            default: return source.includes(target);
        }
    }
}

type Method = 'includes' | 'equal' | 'not-equal';
