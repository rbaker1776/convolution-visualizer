

"use strict";


class Plotter
{
    constructor(canvas)
    {
        console.assert(canvas instanceof HTMLCanvasElement);

        this.canvas = canvas;
        this.ctx = this.canvas.getContext("2d");

        this.ppx = 128; // pixels per unit x
        this.ppy = 128; // pixels per unit y

        this.x_min = -(canvas.width  / this.ppx) * 0.5;
        this.y_min = -(canvas.height / this.ppy) * 0.5;

        this.debug();
    }

    // functions for x_min and y_max to keep a consistent interface
    min_x() { return this.x_min; }
    max_x() { return this.x_min + this.canvas.width / this.ppx; }
    min_y() { return this.y_min; }
    max_y() { return this.y_min + this.canvas.height / this.ppx; }

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
        return (this.canvas.height / window.devicePixelRatio - 1) - ((y - this.y_min) * (this.ppy / window.devicePixelRatio));
    }

    // given an X value (X ∈ ℕ, 0 <= X < canvas.width) representing a canvas coordinate,
    // returns an x value(x ∈ ℝ) representing a value from the domain
    function_x(X)
    {
        return this.x_min + (X / (this.ppx / window.devicePixelRatio));
    }

    // given an Y value (Y ∈ ℕ, 0 <= Y < canvas.height) representing a canvas coordinate,
    // returns a y value(y ∈ ℝ) representing a value from the range
    function_y(Y)
    {
        return this.y_min + (((this.canvas.height / window.devicePixelRatio - 1) - Y) / (this.ppy / window.devicePixelRatio));
    }

    x_range()
    {
        return this.max_x() - this.min_x();
    }

    y_range()
    {
        return this.max_y() - this.min_y();
    }

    resolve(width=this.canvas.width, height=this.canvas.height)
    {
        const px = Math.abs(this.min_x() / this.x_range());
        const py = Math.abs(this.min_y() / this.y_range());

        this.canvas.width = width;
        this.canvas.height = height;
        this.x_min = -px * this.x_range();
        this.y_min = -px * this.y_range();

        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.redraw();
    }

    zoom(center, z=-0.05)
    {
        z = Math.min(Math.max(z, -0.2), 0.2)

        // if the center is 'close enough' to the origin,
        // assume the user meant to zoom into the origin
        if (Math.abs(this.function_x(center.x / window.devicePixelRatio)) / this.x_range() < 0.05)
            center.x = this.canvas_x(0) * window.devicePixelRatio
        if (Math.abs(this.function_y(center.y / window.devicePixelRatio)) / this.y_range() < 0.05)
            center.y = this.canvas_y(0) * window.devicePixelRatio

        const new_ppx = this.ppx * (1 - z);
        const new_ppy = new_ppx; // maybe implement 2-axis scrolling in the future

        this.x_min = this.function_x(center.x / window.devicePixelRatio) - (center.x / new_ppx);
        this.y_min = this.function_y(center.y / window.devicePixelRatio) - ((this.canvas.height - window.devicePixelRatio - center.y) / new_ppy);

        this.ppx = new_ppx;
        this.ppy = new_ppy;

        this.redraw();
    }

    pan(dx=0, dy=0)
    {
        this.x_min += dx / this.ppx;
        this.y_min += dy / this.ppy;
        this.redraw();
    }

    clear_canvas()
    {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw_grid(interval=1, color="gray", width=0.5, font="Cambria Math", fontsize=8)
    {
        this.ctx.beginPath();
        this.ctx.font = `${fontsize}pt ${font}`;
        this.ctx.fillStyle = color;
        this.ctx.textAlign = "center";
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;

        const skip_n_x = Math.max(Math.floor(200 / (this.ppx * interval)), 1);
        const skip_n_y = Math.max(Math.floor(100 / (this.ppy * interval)), 1);

        for (
            let x = Math.floor(this.min_x() / interval) * interval;
            x <= Math.ceil(this.max_x() / interval) * interval;
            x += interval
        )
        {
            if (Math.abs(x) < interval / 2) // no need to redraw axis at (x = 0)
                continue;
            const draw_x = this.canvas_x(x);
            this.ctx.moveTo(draw_x, 0);                      // why not use this.plot_line()?
            this.ctx.lineTo(draw_x, this.canvas.height - 1); // too many calls to ctx.stroke()
            if (Math.round(Math.abs(x) / interval) % skip_n_x == 0)
                this.ctx.fillText(`${x.toExponential(1)}`, draw_x, this.canvas_y(0) - 5);
        }

        this.ctx.textAlign = "right";

        for (
            let y = Math.floor(this.min_y() / interval) * interval;
            y <= Math.ceil(this.max_y() / interval) * interval;
            y += interval
        )
        {
            if (Math.abs(y) < interval / 2) // no need to redraw axis at (y = 0)
                continue;
            const draw_y = this.canvas_y(y);
            this.ctx.moveTo(0, draw_y);
            this.ctx.lineTo(this.canvas.width - 1, draw_y);
            if (Math.round(Math.abs(y) / interval) % skip_n_y == 0)
                this.ctx.fillText(`${y.toExponential(1)}`, this.canvas_x(0) - 5, draw_y - 5);
        }

        if (this.min_x() < 0 && this.max_x() > 0 && this.min_y() < 0 && this.max_y() > 0)
            this.ctx.fillText('0', this.canvas_x(0) - 5, this.canvas_y(0) - 5);
        this.ctx.stroke();
    }

    draw_axes(color="white", width=1)
    {
        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;

        if (this.min_x() < 0 && this.max_x() > 0)
        {
            this.ctx.moveTo(this.canvas_x(0), 0);
            this.ctx.lineTo(this.canvas_x(0), this.canvas.height - 1);
        }

        if (this.min_y() < 0 && this.max_y() > 0)
        {
            this.ctx.moveTo(0, this.canvas_y(0));
            this.ctx.lineTo(this.canvas.width - 1, this.canvas_y(0));
        }

        this.ctx.stroke();
    }

    plot_function(f, color="red", width=2)
    {
        console.assert(f.length == this.canvas.width);

        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas_y(f[0]));

        //let y_prev = f[0];
        const range_y = this.canvas.height + 2 * width; // total range of y values that can be drawn to

        for (let draw_x = 0; draw_x < f.length; ++draw_x)
        {
            const draw_y = Math.min(Math.max(     // cap the function at just above or below the
                this.canvas_y(f[draw_x]),         // canvas bounds to avoid extra computation and
            -width), this.canvas.height + width); // drawing
            //if (Math.abs(draw_y - y_prev) == range_y) // if we have a nearly vertical line
            //    this.ctx.moveTo(draw_x, draw_y);      // don't draw it. This is to handle 
            //else                                      // functions like tan(x), with jumps from +∞
            this.ctx.lineTo(draw_x, draw_y);      //  to -∞ to elide extraneous vertical lines
            //y_prev = draw_y;
        }

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = width;
        this.ctx.stroke();
    }

    debug()
    {
        console.assert(this.canvas_x(this.min_x()) == 0);
        console.assert(this.canvas_x(this.max_x()) == this.canvas.width / window.devicePixelRatio);
        console.assert(this.canvas_y(this.max_y()) == -1);
        console.assert(this.canvas_y(this.min_y()) == this.canvas.height / window.devicePixelRatio - 1);

        console.assert(this.canvas_x(this.function_x(0)) == 0);
        console.assert(this.canvas_y(this.function_y(0)) == 0);
        console.assert(this.function_x(this.canvas_x(0)) == 0);
        console.assert(this.function_y(this.canvas_y(0)) == 0);
    }
}
