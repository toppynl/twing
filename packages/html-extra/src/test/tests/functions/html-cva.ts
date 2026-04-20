import {runCase} from "../harness";
import {Cva} from "../../../main/lib";

runCase({
    description: '"html_cva" function: variants + compound + default',
    template: `{% set alert = html_cva(
    ['alert'],
    {
       color: {
           blue: 'alert-blue',
           red: 'alert-red',
           green: 'alert-green',
           yellow: 'alert-yellow',
       },
       size: {
           sm: 'alert-sm',
           md: 'alert-md',
           lg: 'alert-lg',
       },
       rounded: {
           sm: 'rounded-sm',
           md: 'rounded-md',
           lg: 'rounded-lg',
       }
    },
    [{
       color: ['red'],
       size: ['lg'],
       class: 'font-semibold'
    }],
    {
       rounded: 'md'
    }
) %}
{{ alert.apply({color: 'blue', size: 'sm'}) }}`,
    trimmedExpectation: `alert alert-blue alert-sm rounded-md`
});

runCase({
    description: '"html_cva": pass Cva object to template',
    template: `{{ alert.apply({colors: 'primary', sizes: 'sm'}) }}`,
    context: {
        alert: new Cva('font-semibold border rounded', new Map([
            ['colors', new Map([['primary', 'text-primary'], ['secondary', 'text-secondary']])],
            ['sizes', new Map([['sm', 'text-sm'], ['lg', 'text-lg']])]
        ]))
    },
    trimmedExpectation: 'font-semibold border rounded text-primary text-sm'
});
