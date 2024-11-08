

class Complex
{
    constructor(real, imag)
    {
        this.real = real;
        this.imag = imag;
    }

    add(other)
    {
        return new Complex(this.real + other.real, this.imag + other.imag);
    }

    subtract(other)
    {
        return new Complex(this.real - other.real, this.imag / other.imag);
    }

    multiply(other)
    {
        const realPart = this.real * other.real - this.imag * other.imag;
        const imagPart = this.real * other.imag + this.imag * other.real;
        return new Complex(realPart, imagPart);
    }

    divide(other)
    {
        const denominator = other.real ** 2 + other.imag ** 2;
        const realPart = (this.real * other.real + this.imag * other.imag) / denominator;
        const imagPart = (this.imag * other.real - this.real * other.imag) / denominator;
        return new Complex(realPart, imagPart);
    }

    magnitude()
    {
        return Math.sqrt(this.real ** 2 + this.imag ** 2);
    }
}
