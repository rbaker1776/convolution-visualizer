
//import Point from "./point.js";
//import Plotter from "./plotter.js";


input_ft_field = document.getElementById("f-input");
input_gt_field = document.getElementById("g-input");


// calculates the convolution of two functions
function convolve(ft, gt, delta_t)
{
    // ∀(T)(                    for some x, for all T
    //     (f(T) = 0)           if f(T) = 0,
    //  OR (g(x - T) = 0)       or if g(x - T) = 0,
    //  OR (g(T) = 0)           or if g(T) = 0,
    //  OR (f(x - T) = 0)       or if f(x - T) = 0,
    // ) ==> (f * g)(x) = 0     then (f * g)(x) = 0
    return Array.from(
        { length: ft.length + gt.length - 1 },
        (_, t) => {
            let sum = 0;
            for (let T = Math.max(0, t - (ft.length - 1)); T < Math.min(t, ft.length - 1); ++T)
                sum += ft[t-T] * gt[T] * delta_t * window.devicePixelRatio;
            return sum;
        }
    ).slice(Math.floor(ft.length / 2), Math.floor(ft.length * 3/2));
}


// function plotter redraw function
function redraw_functions()
{
    this.clear_canvas();
    this.draw_grid(interval=Math.pow(10, Math.floor(Math.log10(this.y_range() / 2))));
    this.draw_axes(width=1, color="white");

    const input_ft = parse_fn(input_ft_field.value);
    const input_gt = parse_fn(input_gt_field.value);
    const max_abs_t = Math.max(Math.abs(this.min_x()), Math.abs(this.max_x()))

    let ft_ext, gt_ext, cv, ft, gt
    const begin_idx = Math.max(0, this.canvas_x(this.min_x() + max_abs_t) - this.canvas_x(0));
    const end_idx = begin_idx + this.canvas.width

    ft = evaluate_fn(input_ft, this.min_x(), window.devicePixelRatio / this.ppx, this.canvas.width);
    gt = evaluate_fn(input_gt, this.min_x(), window.devicePixelRatio / this.ppx, this.canvas.width);
    cv = convolve(ft, gt, 1 / this.ppx);

    this.plot_function(gt, color="orange");
    this.plot_function(ft, color="red");
    // this.plot_function(cv, color="cyan");
}


document.addEventListener("DOMContentLoaded", () =>
{
    // initialize function plotter (first canvas)
    const function_plotter = new Plotter(document.getElementById("plot-canvas"));
    function_plotter.redraw = redraw_functions;
    function_plotter.resolve(width=window.innerWidth, height=400);

    let function_plotter_is_panning = false;
    let function_plotter_prev_x = 0;
    let function_plotter_prev_y = 0;

    function_plotter.canvas.addEventListener("wheel", (event) => {
        event.preventDefault();
        function_plotter.zoom.bind(function_plotter);
        function_plotter.zoom(new Point(event.offsetX, event.offsetY), z=event.deltaY / 200);
    });

    function_plotter.canvas.addEventListener("mousedown", () => {

        function_plotter_is_panning = true;
        function_plotter_prev_x = event.offsetX;
        function_plotter_prev_y = event.offsetY;
    });

    function_plotter.canvas.addEventListener("mouseup", () => {
        function_plotter_is_panning = false;
    });

    function_plotter.canvas.addEventListener("mouseleave", () => {
        function_plotter_is_panning = false;
    });

    function_plotter.canvas.addEventListener("mousemove", () => {
        if (function_plotter_is_panning)
        {
            function_plotter.pan.bind(function_plotter);
            function_plotter.pan(dx=(function_plotter_prev_x - event.offsetX), dy=(event.offsetY - function_plotter_prev_y));
            function_plotter_prev_x = event.offsetX;
            function_plotter_prev_y = event.offsetY;
        }
    });

    window.addEventListener("resize", () => {
        function_plotter.resolve.bind(function_plotter);
        function_plotter.resolve(width=window.innerWidth);
    });

    input_ft_field.addEventListener("keydown", (event) => {
        function_plotter.redraw.bind(function_plotter);
        setTimeout(function_plotter.redraw, 100);
    });

    document.documentElement.setAttribute('data-theme', "dark");
});
