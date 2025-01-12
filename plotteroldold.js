/**
 * @fileOverview 2d Plotter class def
 * @author Ryan Baker
 * @version 1.0.0
 * @date Dec-12-2024
 * @license MIT
 *
 * Decription:
 * This script provides functionality for a 2d plotter class that plots on an HTMLCanvasElement
 *
 * Dependencies:
 * (NONE)
**/


"use strict";


//import Point from "./point.js";

/*export default*/ class Plotter
{
    constructor(canvas)
    {
        if (!(canvas instanceof HTMLCanvasElement))
            throw new Error("Argument to Plotter constructor must be an HTMLCanvasElement");

        // canvas related variables
        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");
        this.aspect = canvas.width / canvas.height;

        // plotting related variables
        this.ppx = 128; // pixels per unit x
        this.ppy = 128; // pixels per unit y

        // we use x_min and y_max (instead of both min or both max) because (0, 0) is the top-left of the canvas
        this.x_min = -(canvas.width / this.ppx) * 0.5; // x value that corresponds to (0, _) on the canvas
        this.y_max = (canvas.height / this.ppy) * 0.5; // y value that corresponds to (_, 0) on the canvas

        this.debug();
    }

    // given an x value (x ∈ ℝ) representing a value from the domain,
    // returns an X value(X ∈ ℕ, 0 <= X < canvas.width) representing a canvas coordinate
    canvas_x(x)
    {
        return (x - this.x_min) * (this.ppx / window.devicePixelRatio);
    }

    // given a y value (y ∈ ℝ) representing a value from the range,
    // returns a Y value (Y ∈ ℕ, 0 <= Y < canvas.height) representing a canvas coordinate
    canvas_y(y)
    {
        return (this.y_max - y) * (this.ppy / window.devicePixelRatio);
    }

    // given an X value (X ∈ ℕ, 0 <= X < canvas.width) representing a canvas coordinate,
    // returns an x value(x ∈ ℝ) representing a value from the domain
    function_x(X)
    {
        return this.x_min + X / (this.ppx / window.devicePixelRatio);
    }

    // given an Y value (Y ∈ ℕ, 0 <= Y < canvas.height) representing a canvas coordinate,
    // returns a y value(y ∈ ℝ) representing a value from the range
    function_y(Y)
    {
        return this.y_max - Y / (this.ppy / window.devicePixelRatio);
    }

    // functions for x_min and y_max to keep a consistent interface
    min_x() { return this.x_min; }
    max_x() { return this.x_min + this.canvas.width / this.ppx; }
    min_y() { return this.y_max - this.canvas.height / this.ppy; }
    max_y() { return this.y_max; }

    // redraws the canvas
    // defined externally (depends on the plotter's application)
    redraw()
    {
    }

    // clears the canvas
    clear()
    {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // plots a single Point at (x, y)
    plot_point(point, radius=5, color="black")
    {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(
            this.canvas_x(point.x),
            this.canvas_y(point.y),
            radius,
            0,
            2 * Math.PI
        );
        this.ctx.fill();
    }

    // plots a line from Point p1 to Point p2
    plot_line(p1, p2, width=2, color="black")
    {
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas_x(p1.x), this.canvas_y(p1.y));
        this.ctx.lineTo(this.canvas_x(p2.x), this.canvas_y(p2.y));
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
    }
    
    // plots a function (represented as an array of y-values of length canvas.width)
    plot_function(f, width=4, color="red")
    {
        if (f.length != this.canvas.width)
            throw new Error(`Function length (${f.length}) must match the canvas width (${this.canvas.width})`);

        // initialize the drawer
        this.ctx.beginPath()
        this.ctx.moveTo(0, f[0]);

        let y_prev = f[0]; // stores the previous y value
        const y_range = this.canvas.height + 2 * width; // total range of y values that can be drawn to

        for (let draw_x = 1; draw_y < f.length; ++draw_x)
        {
            const draw_y = Math.min(Math.max(     // cap the function at just above or below the
                this.canvas_y(f[draw_x]),         // canvas bounds to avoid extra computation and
            -width), this.canvas.height + width); // drawing
            if (Math.abs(draw_y - y_prev) == y_range) // if we have a nearly vertical line
                this.ctx.moveTo(draw_x, draw_y);      // don't draw it. This is to handle 
            else                                      // functions like tan(x), with jumps from +∞
                this.ctx.lineTo(draw_x, draw_y);      //  to -∞ to elide extraneous vertical lines
        y_prev = draw_y; // reset y_prev
        }

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.stroke();
    }

    // draws the x-y grid
    draw_grid(interval=1, width=1, color="gray", draw_axes=false)
    {
        this.ctx.beginPath();

        for (let x = Math.ceil(this.min_x()); x <= Math.floor(this.max_x()); x += interval)
        {
            if (!draw_axes && x == 0) // no need to redraw axis at (x = 0)
                continue;
            const draw_x = this.canvas_x(x);
            this.ctx.moveTo(draw_x, 0);                      // why not use this.plot_line()?
            this.ctx.lineTo(draw_x, this.canvas.height - 1); // too many calls to ctx.stroke()
        }

        for (let y = Math.ceil(this.min_y()); y <= Math.floor(this.max_y()); y += interval)
        {
            if (!draw_axes && y == 0) // no need to redraw axis at (y = 0)
                continue;
            const draw_y = this.canvas_y(y);
            this.ctx.moveTo(0, draw_y);
            this.ctx.lineTo(this.canvas.width - 1, draw_y);
        }

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.stroke();
    }

    // draws the x-axis and y-axis
    draw_axes(width=2, color="black")
    {
        this.ctx.beginPath();

        const draw_x = this.canvas_x(0);
        const draw_y = this.canvas_y(0);

        if (draw_x > -width && draw_x < this.canvas.width + width) // if the y-axis is in bounds
        {
            this.ctx.moveTo(draw_x, 0);
            this.ctx.lineTo(draw_x, this.canvas.height - 1);
        }

        if (draw_y > -width && draw_y < this.canvas.height + width) // if the x-axis is in bounds
        {
            this.ctx.moveTo(0, draw_y);
            this.ctx.lineTo(this.canvas.width - 1, draw_y);
        }

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.stroke();
    }

    // zooms into or out of point (x, y) by a factor related to the magnitude of z 
    // z < 0 zooms in, z > 0 zooms out
    zoom(point=Point(0,0), z=-0.005)
    {
        // set ppx and ppy
        const max_ppx = 1_000_000;
        const min_ppx = 1;
        const old_ppx = this.ppx;
        const old_ppy = this.ppy;
        this.ppx = Math.max(Math.min((1 - z) * this.ppx, max_ppx), min_ppx);
        this.ppy = this.ppx; // Implement 2-axis zooming in the future

        // set the canvas bounds
        this.x_min = this.function_x(point.x) - (this.function_x(point.x) - this.x_min) * (old_ppx / this.ppx);
        this.y_max = this.function_y(point.y) + (this.y_max - this.function_y(point.y)) * (old_ppy / this.ppy);

        this.debug();
        this.redraw();
    }

    // pans across the plot by moving the origin (+dx, +dy)
    pan(dx, dy)
    {
        this.x_min += dx;
        this.y_max += dy;
        this.redraw();
    }

    // resolves the canvas to the devicePixelRatio and resizes if desired
    resize(width=this.canvas.width / window.devicePixelRatio, height=this.canvas.height / window.devicePixelRatio)
    {
        const px = Math.abs(this.min_x() / (this.max_x() - this.min_x()));
        const py = Math.abs(this.max_y() / (this.max_y() - this.min_y()));

        this.canvas.width = width * window.devicePixelRatio;
        this.canvas.height = height * window.devicePixelRatio;
        this.aspect = width / height * window.devicePixelRatio;
        this.x_min = -px * (this.max_x() - this.min_x());
        this.y_max = py * (this.max_y() - this.min_y());

        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.redraw();

        this.debug();
    }

    debug()
    {
        console.assert(this.canvas_x(this.min_x()) == 0);
        console.assert(Math.abs(this.canvas_x(this.max_x()) - this.canvas.width / window.devicePixelRatio) <= 1e-2);
        console.assert(Math.abs(this.canvas_y(this.min_y()) - this.canvas.height / window.devicePixelRatio) <= 1e-2);
        console.assert(this.canvas_y(this.max_y()) == 0);

        console.assert(Math.abs(this.function_x(this.canvas_x(0))) <= 1e-8);
        console.assert(Math.abs(this.function_y(this.canvas_y(0))) <= 1e-8);
        console.assert(Math.abs(this.function_x(this.canvas_x(1)) - 1) <= 1e-8);
        console.assert(Math.abs(this.function_y(this.canvas_y(1)) - 1) <= 1e-8);
        console.assert(Math.abs(this.function_x(this.canvas_x(-1)) + 1) <= 1e-8);
        console.assert(Math.abs(this.function_y(this.canvas_y(-1)) + 1) <= 1e-8);
    }
}
