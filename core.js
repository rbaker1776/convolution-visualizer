
const input_ft_field = document.getElementById("f-input");
const input_gt_field = document.getElementById("g-input");

const options_ft = document.getElementById("f-options");
const options_gt = document.getElementById("g-options");

const toggle_ft_box = document.getElementById("ft-checkbox");
const toggle_gt_box = document.getElementById("gt-checkbox");
const toggle_conv_box = document.getElementById("conv-checkbox");

let f = null;
let g = null;
let g_reverse = null;
let convolution = null;
let integral = null;

function calculate_functions()
{
    f = new Function('t', `return ${parse_fn(input_ft_field.value)};`);
    g = new Function('t', `return ${parse_fn(input_gt_field.value)};`);
    convolution = convolve(f, g, -20, 20, cache_fuzz);
}

function calculate_slider_functions(t0)
{
    g_reverse = (t) => { return g(-(t - t0)); };
    integral = (t) => { return f(t) * g_reverse(t); };
}

function redraw_functions()
{
    this.clear_canvas();
    this.draw_grid();
    this.draw_axes();

    if (toggle_gt_box.checked) this.plot_function(g, get_color("--gt-color"));
    if (toggle_ft_box.checked) this.plot_function(f, get_color("--ft-color"));
    if (toggle_conv_box.checked) this.plot_function(convolution, get_color("--conv-color"));
}

function redraw_sliders()
{
    this.clear_canvas();
    this.draw_grid();
    this.draw_axes();

    this.plot_integral(integral, get_color("--area-color"));
    this.plot_function(g_reverse, get_color("--gt-color"));
    this.plot_function(f, get_color("--ft-color"));
    this.plot_function(convolution, get_color("--conv-color"));

    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeStyle = get_color("--grid-color");
    this.ctx.fillStyle = get_color("--conv-color");
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
    document.getElementById("theme-icon").addEventListener("click", () => {
        const current_theme = document.documentElement.getAttribute("data-theme");
        const new_theme = current_theme == "dark" ? "light" : "dark";
        apply_theme(new_theme);
        function_plotter.redraw();
        slide_plotter.redraw();
    });

    apply_theme(init_theme());

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

    function_plotter.view.y_max = 2.5;
    function_plotter.view.y_min = -1;
    function_plotter.view.x_min = -1.5;
    function_plotter.view.x_max = -2 + 3.5 * function_plotter.canvas.width / function_plotter.canvas.height;

    const slide_plotter = new Plotter("slide-canvas", redraw_sliders, { height: 400 });
    slide_plotter.slider_x = 2.5;
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
            calculate_slider_functions(slide_plotter.slider_x);
            slide_plotter.redraw();
        }
    });

    slide_plotter.view.y_min = -1.5;
    slide_plotter.view.y_max = 3.5;
    slide_plotter.view.x_min = -2.5 * slide_plotter.canvas.width / slide_plotter.canvas.height;
    slide_plotter.view.x_max = 2.5 * slide_plotter.canvas.width / slide_plotter.canvas.height;

    calculate_functions();
    calculate_slider_functions(slide_plotter.slider_x);
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

    input_ft_field.addEventListener("keydown", (event) => {
        options_ft.value = "default";
        setTimeout(() => {
            calculate_functions();
            calculate_slider_functions(slide_plotter.slider_x);
            function_plotter.redraw();
            slide_plotter.redraw();
        }, 50);
    });

    input_gt_field.addEventListener("keydown", (event) => {
        options_gt.value = "default";
        setTimeout(() => {
            calculate_functions();
            calculate_slider_functions(slide_plotter.slider_x);
            function_plotter.redraw();
            slide_plotter.redraw();
        }, 20);
    });

    toggle_ft_box.addEventListener("change", () => { function_plotter.redraw(); });
    toggle_gt_box.addEventListener("change", () => { function_plotter.redraw(); });
    toggle_conv_box.addEventListener("change", () => { function_plotter.redraw(); });
});
