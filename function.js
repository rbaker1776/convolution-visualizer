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
        .replace(/\basin\b/g, "Math.asin")
        .replace(/\bacos\b/g, "Math.acos")
        .replace(/\batan\b/g, "Math.atan")
        .replace(/\bsinh\b/g, "Math.sinh")
        .replace(/\bcosh\b/g, "Math.cosh")
        .replace(/\btanh\b/g, "Math.tanh")
        .replace(/\basinh\b/g, "Math.asinh")
        .replace(/\bacosh\b/g, "Math.acosh")
        .replace(/\batanh\b/g, "Math.atanh")
        .replace(/\batan2\b/g, "Math.atan2")
        .replace(/\bsqrt\b/g, "Math.sqrt")
        .replace(/\bcbrt\b/g, "Math.cbrt")
        .replace(/\bexp\b/g, "Math.exp")
        .replace(/\blog\b/g, "Math.log")
        .replace(/\blog10\b/g, "Math.log10")
        .replace(/\blog2\b/g, "Math.log2")
        .replace(/\bpow\b/g, "Math.pow")
        .replace(/\^/g, "**")
        .replace(/(\d+)t/g, "$1*t")
}

