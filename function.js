

const e = Math.exp(1);
const pi = Math.PI;

const u = (t) => { return (t >= 0 ? 1 : 0); };
const dd = (t, delta_t) => { return ((Math.abs(t) < delta_t / 2) ? (1 / Math.abs(delta_t)) : 0); };

const sin = Math.sin;
const cos = Math.cos;

const abs = Math.abs;
const sqrt = Math.sqrt;
const cbrt = Math.cbrt;

const exp = Math.exp;
const log = Math.log;
const log10 = Math.log10;
const log2 = Math.log2;

const floor = Math.floor;
const ceil = Math.ceil;
const min = Math.min;
const max = Math.max;


function evaluate_fn(fn, t_min, delta_t, fn_length)
{
    return Array.from(
        { length: fn_length },
        (_, t) => eval(fn)
    ).map(value => ((Number.isNaN(value) || !Number.isFinite(value))) ? 0 : value);
}

function parse_fn(fn)
{
    let parsed_fn = fn
        .replace(/\s+/g, '') // remove whitespace
        .replace(/\b\^\b/g, '**') // replace '^' with '**' for exponentiation
        .replace(/dd\(([^()]*|\([^)]*\))*\)/g, (match, p1) => { return `dd((${p1}), (delta_t))`; })
        .replace(/\bt\b/g, "(((t) * (delta_t)) + (t_min))");

    return parsed_fn;
}















































































































































/*


function extract_parens(expression, left_idx)
{
    console.assert(expression[left_idx] == '(');
    let i = left_idx + 1;
    let paren_balance = 1;
    while (paren_balance != 0)
    {
        paren_balance += (expression[i] == '(');
        paren_balance -= (expression[i] == ')');
        ++i;
    }
    return expression.slice(left_idx, i);
}

function parse_fn(fn, delta_t)
{
    fn = fn
        .replace(/\s+/g, '') // remove whitespace
        .replace(/\b\^\b/g, '**'); // replace '^' with '**' for exponentiation
    
    let replacements = [];
    let ri = 1;

    for (let i = 0; i < fn.length; ++i)
    {
        if (fn[i] == 'd' && i < fn.length - 1 && fn[++i] == 'd') // we've found a dirac call
        {
            const dirac_arg = extract_parens(fn, ++i);
            replacements.push(`((${dirac_arg}), (delta_t))`);
            i += dirac_arg.length;
        }
    }


}
*/
