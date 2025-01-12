/**
 * @fileOverview 2d Point class def
 * @author Ryan Baker
 * @version 1.0.0
 * @date Dec-12-2024
 * @license MIT
 *
 * Decription:
 * This script provides a 2d point implementation
 *
 * Dependencies:
 * (NONE)
**/


/*export default*/ class Point
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    // static method to create a Point from polar coords (radius, angle)
    static from_polar(radius, angle)
    {
        return new Point(
            radius * Math.cos(angle),
            radius * Math.sin(angle)
        );
    }

    // translate the Point by a given dx and dy
    translate(dx, dy)
    {
        this.x += dx;
        this.y += dy;
    }

    // scale the Point by a given factor
    scale(factor)
    {
        this.x *= factor;
        this.y *= factor;
    }
}
