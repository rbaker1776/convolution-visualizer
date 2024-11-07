

const e = Math.exp(1);

const pi = Math.PI;

function u(t)
{
    return (t >= 0 ? 1 : 0);
}

function dd(t, deltaT)
{
    return (
        Math.abs(t) <= Math.abs(deltaT / 2)
      ? 1 / Math.abs(deltaT)
      : 0
    );
}

function evaluate(func, tMin, tMax, deltaT)
{
    return Array.from(
        { length: Math.ceil((tMax - tMin) / deltaT) },
        (_, t) => eval(func)
    );
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

function parseExpression(expression)
{
    expression = expression
        .replace(/\s+/g, "")
        .replace(/\bsin\b/g, "Math.sin")
        .replace(/\bcos\b/g, "Math.cos")
        .replace(/\babs\b/g, "Math.abs")
        .replace(/\bsqrt\b/g, "Math.sqrt")
        .replace(/\bcbrt\b/g, "Math.cbrt")
        .replace(/\bexp\b/g, "Math.exp")
        .replace(/\blog\b/g, "Math.log")
        .replace(/\blog10\b/g, "Math.log10")
        .replace(/\blog2\b/g, "Math.log2")
        .replace(/\bfloor\b/g, "Math.floor")
        .replace(/\bceil\b/g, "Math.ceil")
        .replace(/\bmin\b/g, "Math.min")
        .replace(/\bmax\b/g, "Math.max")
        .replace(/\^/g, "**")
        .replace(/dd\(([^)]*)\)/g, (match, p1) => {
            return `dd(${p1}, deltaT)`;
        })
        .replace(/\bt\b/g, "(t * deltaT + tMin)");

    const t = 0;
    const tMin = 0;
    const deltaT = 1;
    
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

