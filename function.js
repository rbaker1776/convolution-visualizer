function u(t)
{
    return (t >= 0 ? 1 : 0);
}

function parse(inputFunc)
{
    return inputFunc
        .replace(/\bsin\b/g, "Math.sin")
        .replace(/\bcos\b/g, "Math.cos")
        .replace(/\btan\b/g, "Math.tan")
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
}

