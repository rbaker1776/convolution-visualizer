

// DEFINED CONSTANTS

const e = Math.exp(1);

const pi = Math.PI;

const validPattern = /^(\d+(\.\d+)?|\bt\b|\b(sin|cos|exp|abs|floor|dd|u)\b|[\+\-\*\/\(\)\?\:])+$/;

// DEFINED FUNCTIONS

const u = (t) => { return (t >= 0 ? 1 : 0); };
const dd = (t, deltaT) => { return (Math.abs(t) <= Math.abs(deltaT / 2) ? (1 / Math.abs(deltaT)) : 0); };

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


function dropdownSelect(selection)
{
    switch (selection)
    {
        case "unitStep":    return "u(t)";
        case "pulse":       return "u(t) * u(1-t)";
        case "impulse":     return "dd(t)";
        case "expDecay":    return "exp(-t) * u(t)";
        case "triangle":    return "(1 - abs(t-1)) * u(t) * u(2-t)";
        case "gaussian":    return "exp(-1/2 * 2*pi * t**2)"
        case "dampedSine":  return "sin(4*t) * exp(-t) * u(t)";
        case "dampedSq":    return "(-1)^floor(2*t) * exp(-floor(2*t)/2) * u(t)"
        case "biphasic":    return "exp(-t) * (u(t) * u(1-t) - u(t-1) * u(2-t))";
        case "triphasic":   return "exp(-t/2) * (u(t) * u(1-t) - u(t-1) * u(2-t) + u(t-2) * u(3-t))";
        case "pulseTrain":  return "dd(t) - dd(t-1.2) + dd(t-2.4) - dd(t-3.6) + dd(t-4.8) - dd(t-6)";
        case "echo":        return "dd(t) + 0.5*dd(t-0.8) + 0.25*dd(t-1.6) + 0.125*dd(t-2.4) + 0.0625*dd(t-3.2)";
    }
}

function evaluate(func, tMin, tMax, deltaT)
{
    return Array.from(
        { length: Math.ceil((tMax - tMin) / deltaT) },
        (_, t) => eval(func)
    ).map(value => (Number.isNaN(value) || !Number.isFinite(value)) ? 0 : value);
}

function convolve(ft, gt, deltaT)
{
    return Array.from(
        { length: ft.length + gt.length - 1 },
        (_, t) => {
            let sum = 0;
            for (let T = Math.max(0, t - (ft.length - 1)); T < Math.min(t, ft.length - 1); ++T)
                sum += ft[t-T] * gt[T] * deltaT;
            return sum;
        }
    ).slice(Math.floor(ft.length / 2), Math.floor(ft.length * 3/2));
}

function parseExpression(expression, deltaT)
{
    expression = expression
        .replace(/\s+/g, "")
        .replace(/\b\^\b/g, "**")
        .replace(/dd\(([^)]*)\)/g, (match, p1) => {
            return `dd(${p1}, deltaT)`;
        })
        .replace(/\bt\b/g, "(t * deltaT + tMin)");

    const t = 0;
    const tMin = 0;
    
    try
    {
        const result = eval(expression);
        return expression;
    }
    catch (error)
    {
        return false;
    }
}
