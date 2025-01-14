

"use strict";


class Point
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }
}


class Plotter
{
    constructor(canvas_id, redraw = () => {}, options = {})
    {
        this.canvas = document.getElementById(canvas_id);
        this.ctx = this.canvas.getContext("2d");

        this.redraw = redraw;
            
        this.scale = window.devicePixelRatio || 1;
        this.canvas.width = options.width || window.innerWidth;
        this.canvas.height = options.height || window.innerHeight;
        this.ctx.scale(this.scale, this.scale);

        this.options = {
            axis_color: options.axis_color || "white",
            grid_color: options.grid_colot || "gray",
            function_color: options.function_color || "red",
            integral_color: options.integral_color || "green",
        }

        this.view = {
            x_min: options.x_min || -5,
            y_min: options.y_min || -5 * this.canvas.height / this.canvas.width,
            x_max: options.x_max || 5,
            y_max: options.y_max || 5 * this.canvas.height / this.canvas.width,
        }

        this.is_panning = false;
        this.pan_origin = new Point(0, 0);

        this.init_event_listeners();
    }

    map_x_to_pixel(x)
    {
        const { x_min, x_max } = this.view;
        const width = this.canvas.width / this.scale;
        return ((x - x_min) / (x_max - x_min)) * width;
    }

    map_y_to_pixel(y)
    {
        const { y_min, y_max } = this.view;
        const height = this.canvas.height / this.scale;
        return height - ((y - y_min) / (y_max - y_min)) * height;
    }

    map_pixel_to_x(pixel)
    {
        const { x_min, x_max } = this.view;
        const width = this.canvas.width / this.scale;
        return x_min + (x_max - x_min) * (pixel / width);
    }

    map_pixel_to_y(pixel)
    {
        const { y_min, y_max } = this.view;
        const height = this.canvas.height / this.scale;
        return y_max - (y_max - y_min) * (pixel / height);
    }

    delta_t()
    {
        return this.map_pixel_to_x(1) - this.map_pixel_to_x(0);
    }

    // method to rescale the canvas and ctx when window size changes
    resolve(width, height)
    {
        const { canvas, ctx, view } = this;
        const { x_min, x_max, y_min, y_max } = view;

        view.x_max +=  0.5 * (width - canvas.width) * (x_max - x_min) / canvas.width;
        view.x_min -=  0.5 * (width - canvas.width) * (x_max - x_min) / canvas.width;
        view.y_max +=  0.5 * (height - canvas.height) * (y_max - y_min) / canvas.height;
        view.y_min -=  0.5 * (height - canvas.height) * (y_max - y_min) / canvas.height;

        canvas.width = width;
        canvas.height = height;

        ctx.scale(this.scale, this.scale);
        this.redraw();
    }

    zoom(center, zoom_factor)
    {
        const { canvas, ctx, view } = this;
        const { x_min, x_max, y_min, y_max } = view;

        // if the center is 'close enough' to the origin,
        // assume the user meant to zoom into the origin
        if (Math.abs(center.x / (x_max - x_min)) < 0.05) { center.x = 0; }
        if (Math.abs(center.y / (y_max - y_min)) < 0.05) { center.y = 0; }

        zoom_factor = Math.min(Math.max(zoom_factor, -0.2), 0.2);

        const min_y_range = 2;
        zoom_factor = Math.max(zoom_factor, min_y_range / (y_max - y_min) - 1);

        const max_y_range = 12;
        zoom_factor = Math.min(zoom_factor, max_y_range / (y_max - y_min) - 1);

        view.x_max = Math.min(center.x + (x_max - center.x) * (1 + zoom_factor), 1e10);
        view.x_min = Math.max(center.x + (x_min - center.x) * (1 + zoom_factor), -1e10);
        view.y_max = center.y + (y_max - center.y) * (1 + zoom_factor);
        view.y_min = center.y + (y_min - center.y) * (1 + zoom_factor);

        const max_x_abs_value = 60;
        const max_y_abs_value = 24;

        if (view.x_min < -max_x_abs_value) this.pan(-max_x_abs_value - view.x_min, 0);
        if (view.x_max >  max_x_abs_value) this.pan( view.x_max - max_x_abs_value, 0);
        if (view.y_min < -max_y_abs_value) this.pan(0, -max_y_abs_value - view.y_min);
        if (view.y_max >  max_y_abs_value) this.pan(0,  view.y_max - max_y_abs_value);

        this.redraw();
    }

    pan(dx, dy)
    {
        const { view } = this;
        const { x_min, x_max, y_min, y_max } = view;

        const max_x_abs_value = 60;
        const max_y_abs_value = 24;

        dx = Math.max(Math.min(dx, max_x_abs_value - x_max), -max_x_abs_value - x_min);
        dy = Math.max(Math.min(dy, max_y_abs_value - y_max), -max_y_abs_value - y_min);

        view.x_max += dx;
        view.x_min += dx;
        view.y_max += dy;
        view.y_min += dy;

        this.redraw();
    }

    clear_canvas()
    {
        this.ctx.clearRect(0, 0, this.canvas.width / this.scale, this.canvas.height / this.scale);
    }

    draw_line(from, to, stroke = false, options = {})
    {
        if (stroke) this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        if (stroke) this.ctx.stroke();
    }

    draw_point(point, radius)
    {
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    draw_axes()
    {
        const { canvas, ctx, options, view, scale } = this;
        const { x_min, x_max, y_min, y_max } = view;

        ctx.strokeStyle = options.axis_color;
        ctx.lineWidth = 1 / scale;

        if (y_min <= 0 && y_max >= 0)
        {
            const x_axis_pixel = this.map_y_to_pixel(0);
            this.draw_line(new Point(0, x_axis_pixel), new Point(canvas.width / scale, x_axis_pixel), true);
        }

        if (x_min <= 0 && x_max >= 0)
        {
            const y_axis_pixel = this.map_x_to_pixel(0);
            this.draw_line(new Point(y_axis_pixel, 0), new Point(y_axis_pixel, canvas.height / scale), true);
        }
    }

    draw_grid()
    {
        const { canvas, ctx, options, view, scale } = this;
        const { x_min, x_max, y_min, y_max } = view;

        const width = canvas.width / this.scale;
        const height = canvas.height / this.scale;

        ctx.strokeStyle = options.grid_color;
        ctx.lineWidth = 0.5 / scale;
        ctx.beginPath();

        const grid_spacing = 1

        for (let x = Math.ceil(x_min / grid_spacing) * grid_spacing; x <= x_max; x += grid_spacing)
        {
            const x_pixel = this.map_x_to_pixel(x);
            this.draw_line(new Point(x_pixel, 0), new Point(x_pixel, canvas.height / scale));
        }

        for (let y = Math.ceil(y_min / grid_spacing) * grid_spacing; y <= y_max; y += grid_spacing)
        {
            const y_pixel = this.map_y_to_pixel(y);
            this.draw_line(new Point(0, y_pixel), new Point(canvas.width / scale, y_pixel));
        }

        ctx.stroke();
    }

    plot_function(fn, color)
    {
        const { canvas, ctx, options, view, scale } = this;
        const { x_min, x_max, y_min, y_max } = view;
        const width = this.canvas.width / this.scale;

        ctx.strokeStyle = color || options.function_color;
        ctx.lineWidth = 4 / scale;
        ctx.beginPath();
        ctx.moveTo(0, this.map_y_to_pixel(fn(x_min)));

        const dx = (x_max - x_min) / width;

        for (let x = x_min; x <= x_max; x += dx)
        {
            const y = fn(x);
            const x_pixel = this.map_x_to_pixel(x);
            const y_pixel = this.map_y_to_pixel(y);
            ctx.lineTo(x_pixel, y_pixel);
        }

        ctx.stroke();
    }

    plot_integral(fn, color)
    {
        const { canvas, ctx, options, view, scale } = this;
        const { x_min, x_max, y_min, y_max } = view;
        const width = this.canvas.width / this.scale;

        ctx.fillStyle = color || options.integral_color;
        ctx.lineWidth = 2 / this.scale;
        ctx.beginPath();
        ctx.moveTo(0, this.map_y_to_pixel(0));
        ctx.lineTo(0, this.map_y_to_pixel(fn(x_min)));

        const x_axis_pixel = this.map_y_to_pixel(0);
        const dx = (x_max - x_min) / width;

        for (let x = x_min; x <= x_max; x += dx)
        {
            const y = fn(x);
            const x_pixel = this.map_x_to_pixel(x);
            const y_pixel = this.map_y_to_pixel(y);
            ctx.lineTo(x_pixel, y_pixel);
        }

        ctx.lineTo(this.canvas.width, this.map_y_to_pixel(0));
        ctx.lineTo(0, this.map_y_to_pixel(fn(x_min)));
        ctx.fill();
    }

    redraw() {}

    init_event_listeners()
    {
        window.addEventListener("resize", () => {
            this.resolve(window.innerWidth, 400);
        });

        this.canvas.addEventListener("wheel", (e) => {
            e.preventDefault();
            this.zoom(new Point(
                this.map_pixel_to_x(e.offsetX / this.scale),
                this.map_pixel_to_y(e.offsetY / this.scale)
            ), e.deltaY / 256);
        });

        this.map_x_to_pixel.bind(this);
        this.map_y_to_pixel.bind(this);
        this.map_pixel_to_x.bind(this);
        this.map_pixel_to_y.bind(this);

        this.zoom.bind(this);
        this.pan.bind(this);
    }
}
