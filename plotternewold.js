class Plotter
{
    constructor(canvas)
    {
        // canvas related variables
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.aspect = canvas.width / canvas.height;

        // plotting related variables
        this.scale = 3;
        this.t_min = -this.scale * this.aspect * 0.5 / window.devicePixelRatio;
        this.f_max = this.scale * 0.5;

        // panning related variables
        this.is_panning = false;
        this.t_prev = 0;
        this.f_prev = 0;

        // member functions
        this.redraw_func = () => {};          // external handle to this.redraw()
        this.redraw = this.redraw.bind(this); // redraws the canvas
        this.resize = this.resize.bind(this); // handles window resizing
        this.zoom   = this.zoom.bind(this);   // zooms in and out
        this.pan    = this.pan.bind(this);    // pans around the graph
    }

    // convert to and from canvas coordinates (x and y) and graph coordinates (t and f)
    // y <-> f
    // x <-> t
    x_to_t(x) { return this.t_min + (x / this.canvas.width) * this.scale * this.aspect; }
    y_to_f(y) { return this.fMax - (y * window.devicePixelRatio / this.canvas.height) * this.scale; } 
    t_to_x(t) { return (t - this.tMin) / (this.scale * this.aspect) * this.canvas.width; }
    f_to_y(f) { return (this.fMax - f) / (this.scale * window.devicePixelRatio) * this.canvas.height; }

    // draws x and y axis lines
    // for internal use by this.redraw()
    draw_axes()
    {
        this.ctx.beginPath();

        // axes should intersect at (t, f) = (0, 0)
        const draw_x = this.t_to_x(0);
        const draw_y = this.f_to_y(0);

        this.ctx.move_to(draw_x, 0);
        this.ctx.line_to(draw_x, this.canvas.height);
        this.ctx.move_to(0, draw_y);
        this.ctx.line_to(this.canvas.width, draw_y);

        this.ctx.stroke_style = get_color("--axis-color");
        this.ctx.line_width = 2;
        this.ctx.stroke();
    }

    // draws grid lines and numbers
    // for internal use by this.redraw()
    draw_grid()
    {
        // distance between grid lines (measured in units t)
        const interval = Math.pow(10, Math.floor(Math.log10(this.scale * 0.5)));
        
        // drawing bounds
        const ti_min = Math.floor(this.t_min / interval) * interval;
        const ti_max = Math.floor((this.t_min + this.scale * this.aspect) / interval) * interval;
        const fi_min = Math.floor((this.f_max - this.scale) / interval) * interval;
        const fi_max = Math.floor(this.f_max / interval) * interval;
        const x_0 = this.t_to_x(0);
        const y_0 = this.f_to_y(0);

        // distance between gridlines and text
        const offset = 5;

        this.ctx.beginPath()
        this.ctx.font = "16pt Cambria Math";
        this.ctx.fillStyle = get_color("--grid-color");
        this.ctx.textAligh = "right";

        // draw vertical grid lines
        for (let t = ti_min; t <= ti_max; t += interval)
        {
            if (Math.abs(t) < interval / 2)
            {
                this.ctx.fillText(0, x_0 - offset, y_0 - offset)
                continue; // no need to draw grid lines over the existing axes
            }
            const draw_x = this.t_to_x(t); // drawing coordinate
            if ( // boolean to decide whether or not to draw number
                   (this.scale * this.aspect / interval < 30) // draw every tick when there are < 30 to draw
                || (this.scale * this.aspect / interval < 60 && Math.round(t / interval) % 5 == 0) // else every fifth (< 60)
                || (Math.round(t / interval) % 10 == 0) // else every tenth
            )
                this.ctx.fillText(`${t}`, draw_x - offset, y_0 - offset); // draw the digit
            this.ctx.moveTo(draw_x, 0);
            this.ctx.lineTo(draw_x, this.canvas.height);
        }

        // draw horizontal grid lines
        for (let f = fi_min; f <= fi_max; f += interval)
        {
            // no need to redraw the existing axis
            if (Math.abs(f) < interval / 2)
                continue;
            const draw_y = this.f_to_y(f);
            if ( // boolean to decide whether or not to draw number
                   (this.scale * this.aspect / interval < 6) // draw every tick when there are < 6 to draw
                || (this.scale * this.aspect / interval < 60 && Math.round(t / interval) % 2 == 0) // else every other (< 18)
                || (Math.round(t / interval) % 10 == 0) // else every tenth
            )
                this.ctx.fillText(`${t}`, draw_x - offset, y_0 - offset); // draw the digit
            this.ctx.moveTo(0, draw_y);
            this.ctx.lineTo(this.canvas.width, draw_y);
        }

        this.ctx.strokeStyle = get_color("--grid-color");
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }

    // redraw canvas
    redraw() { this.redraw_func.call(this); } // is this JavaScript's fault? or mine? or both? this is awful

    // resizes the canvas when the window width changes
    resize(height)
    {
        const width = window.innerWidth;
        const p = Math.abs(this.t_min / (this.scale * this.aspect));
        
        this.canvas.width = width * window.devicePixelRatio;
        this.canvas.height = height * window.devicePixelRatio;
        this.aspect = (width / height) * window.devicePixelRatio;
        this.t_min = -p * this.scale * this.aspect;

        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        this.redraw();
    }

    // handles zooming in and out of the plot
    zoom(event)
    {
        // prevent page scrolling
        event.preventDefault();

        // prevent zooming too far
        const min_scale = 2;
        const max_scale = 20;
        
        // find the center of the zoom

    }
}
