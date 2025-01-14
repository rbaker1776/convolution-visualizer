

const input_ft_field = document.getElementById("f-input");
const input_gt_field = document.getElementById("g-input");

const options_ft = document.getElementById("f-options");
const options_gt = document.getElementById("g-options");

let f = null;
let g = null;
let convolution = null;

function calculate_functions()
{
    f = new Function('t', `return ${parse_fn(input_ft_field.value)};`);
    g = new Function('t', `return ${parse_fn(input_gt_field.value)};`);
    convolution = convolve(f, g, -10, 10, cache_fuzz);
}

function redraw_functions()
{
    this.clear_canvas();
    this.draw_grid();
    this.draw_axes();

    this.plot_function(g, "orange");
    this.plot_function(f, "red");
    this.plot_function(convolution, "cyan");
}

function redraw_sliders()
{
    this.clear_canvas();
    this.draw_grid();
    this.draw_axes();

    const f = new Function('t', `return ${parse_fn(input_ft_field.value)};`);
    const g = new Function('t', `return ${parse_fn(input_gt_field.value)};`);
    const g_reverse = (t) => { return g(-(t - this.slider_x)); };
    //const integral = (t) => { return f(t) * g_reverse(t); };

    //this.plot_integral(integral, "rgba(67, 166, 44, 0.4)");
    this.plot_function(g_reverse, "orange");
    this.plot_function(f, "red");
    this.plot_function(convolution, "cyan");

    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeStyle = "gray";
    this.ctx.fillStyle = "cyan";
    this.ctx.lineWidth = 3 / this.scale;
    this.draw_line(
        new Point(this.map_x_to_pixel(this.slider_x), 0),
        new Point(this.map_x_to_pixel(this.slider_x), this.canvas.height / this.scale),
        true 
    );
    this.draw_point(new Point(this.map_x_to_pixel(this.slider_x), this.map_y_to_pixel(convolution(this.slider_x))), 5 / this.scale);
    this.ctx.setLineDash([]);
}


document.addEventListener("DOMContentLoaded", () => {
    const function_plotter = new Plotter("plot-canvas", redraw_functions, { height: 400 });
   
    function_plotter.canvas.addEventListener("mousedown", (e) => {
        function_plotter.is_panning = true;
        function_plotter.pan_origin = new Point(
            function_plotter.map_pixel_to_x(e.offsetX / function_plotter.scale),
            function_plotter.map_pixel_to_y(e.offsetY / function_plotter.scale)
        );
    });

    function_plotter.canvas.addEventListener("mouseup", () => {
        function_plotter.is_panning = false;
    });

    function_plotter.canvas.addEventListener("mouseleave", () => {
        function_plotter.is_panning = false;
    });

    function_plotter.canvas.addEventListener("mousemove", (e) => {
        if (function_plotter.is_panning)
        {
            function_plotter.pan(
                function_plotter.pan_origin.x - function_plotter.map_pixel_to_x(e.offsetX / function_plotter.scale),
                function_plotter.pan_origin.y - function_plotter.map_pixel_to_y(e.offsetY / function_plotter.scale),
            );
            function_plotter.pan_origin = new Point(
                function_plotter.map_pixel_to_x(e.offsetX / function_plotter.scale),
                function_plotter.map_pixel_to_y(e.offsetY / function_plotter.scale)
            );
        }
    });


    const slide_plotter = new Plotter("slide-canvas", redraw_sliders, { height: 400 });
    slide_plotter.slider_x = 1;
    slide_plotter.is_sliding = false;
    slide_plotter.slide_origin = 0;

    slide_plotter.canvas.addEventListener("mousedown", (e) => {
        const point = new Point(
            slide_plotter.map_pixel_to_x(e.offsetX / slide_plotter.scale),
            slide_plotter.map_pixel_to_y(e.offsetY / slide_plotter.scale)
        );

        if (Math.abs((point.x - slide_plotter.slider_x) / (slide_plotter.view.x_max - slide_plotter.view.x_min)) < 0.02)
        {
            slide_plotter.is_sliding = true;
            slide_plotter.slide_origin = point.x;
        }
        else
        {
            slide_plotter.is_panning = true;
            slide_plotter.pan_origin = point;
        }
    });

    slide_plotter.canvas.addEventListener("mouseup", () => {
        slide_plotter.is_panning = false;
        slide_plotter.is_sliding = false;
    });

    slide_plotter.canvas.addEventListener("mouseleave", () => {
        slide_plotter.is_panning = false;
        slide_plotter.is_sliding = false;
    });

    slide_plotter.canvas.addEventListener("mousemove", (e) => {
        if (slide_plotter.is_panning)
        {
            slide_plotter.pan(
                slide_plotter.pan_origin.x - slide_plotter.map_pixel_to_x(e.offsetX / slide_plotter.scale),
                slide_plotter.pan_origin.y - slide_plotter.map_pixel_to_y(e.offsetY / slide_plotter.scale),
            );
            slide_plotter.pan_origin = new Point(
                slide_plotter.map_pixel_to_x(e.offsetX / slide_plotter.scale),
                slide_plotter.map_pixel_to_y(e.offsetY / slide_plotter.scale)
            );
        }
        else if (slide_plotter.is_sliding)
        {
            const dx = slide_plotter.slide_origin - slide_plotter.map_pixel_to_x(e.offsetX / slide_plotter.scale);
            slide_plotter.slider_x -= dx;
            slide_plotter.slide_origin = slide_plotter.map_pixel_to_x(e.offsetX / slide_plotter.scale);
            slide_plotter.redraw();
        }
    });

    calculate_functions();
    function_plotter.redraw();
    slide_plotter.redraw();

    options_ft.addEventListener("change", () => {
        const selection = options_ft.value;
        input_ft_field.value = dropdown_select(selection);
        calculate_functions();
        function_plotter.redraw();
        slide_plotter.redraw();
    });

    options_gt.addEventListener("change", () => {
        const selection = options_gt.value;
        input_gt_field.value = dropdown_select(selection);
        calculate_functions();
        function_plotter.redraw();
        slide_plotter.redraw();
    });

    document.documentElement.setAttribute('data-theme', "dark");
});
