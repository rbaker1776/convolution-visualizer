

const e = Math.exp(1);
const pi = Math.PI;

const u = (t) => {
    return (t >= -1e-10 ? 1 : 0);
};

const dd = (t, delta_t) => {
    delta_t = delta_t || Number.EPSILON;
    return ((Math.abs(t) < delta_t / 2) ? (1 / Math.abs(delta_t)) : 0);
};

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


function parse_fn(fn)
{
    let parsed_fn = fn
        .replace(/\s+/g, '') // remove whitespace
        .replace(/\b\^\b/g, '**') // replace '^' with '**' for exponentiation

    return parsed_fn;
}


const cache_fuzz = 5e-3

function memoize(fn)
{
    const cache = new Map();

    return function(t)
    {
        t = Math.round(t / cache_fuzz) * cache_fuzz;
        if (cache.has(t))
        {
            return cache.get(t);
        }
        const result = fn(t);
        cache.set(t, result);
        return result;
    };
}

// calculates the convolution of two functions
function convolve(f, g, t_min, t_max, delta_t)
{
    return memoize((t) => {
        let sum = 0;
        for (let T = t_min - (t_max - t_min); T <= t_max + (t_max - t_min); T += delta_t)
            sum += f(T) * g(t - T) * delta_t;
        return sum;
    });
}


function dropdown_select(selection)
{
    switch(selection)
    {
        case "unit-step":   return "u(t)";
        case "pulse":       return "u(t) * u(1 - t)";
        case "impulse":     return "dd(t)";
        case "exp-decay":   return "exp(-t) * u(t)";
        case "ramp":        return "(1 - abs(t-1)) * u(t) * u(2-t)"
        case "gaussian":    return "exp(-1/2 * 2*pi * t**2)"
        case "damped-sin":  return "sin(4*t) * exp(-t) * u(t)";
        case "damped-sq":   return "(-1)^floor(2*t) * exp(-floor(2*t)/2) * u(t)"
        case "biphasic":    return "exp(-t) * (u(t) * u(1-t) - u(t-1) * u(2-t))";
        case "triphasic":   return "exp(-t/2) * (u(t) * u(1-t) - u(t-1) * u(2-t) + u(t-2) * u(3-t))";
        case "pulse-train": return "dd(t) - dd(t-1.2) + dd(t-2.4) - dd(t-3.6) + dd(t-4.8) - dd(t-6)";
    }
}
