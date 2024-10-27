

function drawAxes()
{
    plotCtx.beginPath();

    plotCtx.moveTo(0, plotCanvas.height / 2);
    plotCtx.lineTo(plotCanvas.width, plotCanvas.height / 2);
    plotCtx.moveTo(plotCanvas.width / 2, 0);
    plotCtx.lineTo(plotCanvas.width / 2, plotCanvas.height);

    plotCtx.strokeStyle = "white";
    plotCtx.lineWidth = 2;
    plotCtx.stroke();
}

function drawGrid()
{
    plotCtx.beginPath();
   
    const interval = Math.pow(10, Math.floor(Math.log10(plotScale)));

    for (let i = 1; i <= Math.floor(plotScale * plotAspect / interval); i++)
    {
        const drawXR = (plotCanvas.width / 2) + (i * interval) * (plotCanvas.height / (2 * plotScale));
        const drawXL = (plotCanvas.width / 2) - (i * interval) * (plotCanvas.height / (2 * plotScale));
        plotCtx.moveTo(drawXR, 0);
        plotCtx.lineTo(drawXR, plotCanvas.height);
        plotCtx.moveTo(drawXL, 0);
        plotCtx.lineTo(drawXL, plotCanvas.height);
    }

    for (let i = 1; i <= Math.floor(plotScale / interval); i++)
    {
        const drawYT = (plotCanvas.height / 2) + (i * interval) * (plotCanvas.height / (2 * plotScale));
        const drawYB = (plotCanvas.height / 2) - (i * interval) * (plotCanvas.height / (2 * plotScale));
        plotCtx.moveTo(0, drawYT);
        plotCtx.lineTo(plotCanvas.width, drawYT);
        plotCtx.moveTo(0, drawYB);
        plotCtx.lineTo(plotCanvas.width, drawYB);
    }

    plotCtx.strokeStyle = "grey";
    plotCtx.lineWidth = 1;
    plotCtx.stroke();
}

function plotFunction(func, color)
{
    let yPrev = (plotCanvas.height / 2) * (1 - func[0] / plotScale);
    plotCtx.beginPath();
    plotCtx.moveTo(-1, yPrev);

    for (let i = 0; i < func.length; ++i)
    {
        const drawX = i / (func.length / plotCanvas.width);
        const drawY = Math.min(Math.max(
            ((plotCanvas.height / 2) * (1 - func[i] / plotScale))
        , -1), plotCanvas.height + 1);

        if (
            (drawY == plotCanvas.height + 1 || drawY == -1)
         && (yPrev == plotCanvas.height + 1 || yPrev == -1)
        )
            plotCtx.moveTo(drawX, drawY);
        else
            plotCtx.lineTo(drawX, drawY);

        yPrev = drawY;
    }

    plotCtx.strokeStyle = color;
    plotCtx.lineWidth = 5;
    plotCtx.stroke();
}

function evaluate(func)
{
    const tMin = -plotAspect * plotScale;
    const deltaT = -2 * tMin / plotCanvas.width;
    func = parse(func.replace(/\bt\b/g, "(t * deltaT + tMin)"));

    return Array.from(
        { length: Math.ceil((-2 * tMin) / deltaT) },
        (_, t) => eval(func)
    );
}

function convolve(ft, gt)
{
    const tMin = -plotAspect * plotScale;
    const deltaT = -2 * plotScale * plotAspect / plotCanvas.width;

    let convolution = Array.from(
        { length: ft.length + gt.length - 1 },
        (_, t) => {
            let sum = 0;
            for (let T = Math.max(0, t - (ft.length - 1)); T < Math.min(t, ft.length - 1); T++)
                sum -= ft[t - T] * gt[T] * deltaT;
            return sum;
        }
    ).slice(Math.floor(ft.length / 2), Math.floor(ft.length * 3 / 2)); 

    return convolution;
}

function drawPlotCanvas()
{
    const inputFt = parse(document.getElementById("fInput").value);
    const inputGt = parse(document.getElementById("gInput").value)

    plotCtx.clearRect(0, 0, plotCanvas.width, plotCanvas.height);
    drawAxes()
    drawGrid();
    
    const ft = evaluate(inputFtField.value);
    const gt = evaluate(inputGtField.value);
    const convolution = convolve(ft, gt);

    if (displayGtBox.checked)
        plotFunction(gt, "orange");
    if (displayFtBox.checked)
        plotFunction(ft, "red");
    if (displayConvolutionBox.checked)
        plotFunction(convolution, "cyan");
}

function resizePlotCanvas()
{
    const width = window.innerWidth;
    const height = 600;

    plotCanvas.width = width * window.devicePixelRatio;
    plotCanvas.height = height * window.devicePixelRatio;
    plotAspect = width / height;

    plotCtx.scale(window, window.devicePixelRatio, window.devicePixelRatio);

    drawPlotCanvas();
}

function zoomPlot(event)
{
    event.preventDefault();

    if (event.deltaY > 0)
        plotScale *= Math.max(1 + event.deltaY / 100);
    else
        plotScale /= Math.max(1 - event.deltaY / 100);

    drawPlotCanvas();
}

function dropdownFunc(selection)
{
    switch (selection)
    {
        case "unitStep":    return "u(t)";
        case "pulse":       return "u(t) - u(t-1)";
        case "expDecay":    return "exp(-t) * u(t)";
        case "triangle":    return "t * u(t) * u(1-t) + (2-t) * u(t-1) * u(2-t)";
        case "dampedSine":  return "sin(4*t) * exp(-t) * u(t)";
        case "dampedSq":    return "(-1)^floor(2*t) * exp(-floor(2*t)/2) * u(t)"
        case "biphasic":    return "exp(-t) * (u(t) * u(1-t) - u(t-1) * u(2-t))";
        case "triphasic":   return "exp(-t/2) * (u(t) * u(1-t) - u(t-1) * u(2-t) + u(t-2) * u(3-t))";
        default: return "";
    }

}

const e = Math.exp(1);

function dd(t)
{
    const deltaT = plotScale * plotAspect * 2 / plotCanvas.width;
    return ((
        (Math.abs(t + deltaT) >= Math.abs(t))
     && (Math.abs(t - deltaT) >= Math.abs(t))
    ) ? (1 / deltaT) : 0);
}

const plotCanvas = document.getElementById("plotCanvas");
const plotCtx = plotCanvas.getContext("2d");

var plotAspect = plotCanvas.width / plotCanvas.height;
var plotScale = 5;

const inputFtField = document.getElementById("fInput");
const inputGtField = document.getElementById("gInput");

const optionsFt = document.getElementById("fOptions");
const optionsGt = document.getElementById("gOptions");

const displayFtBox = document.getElementById("toggleFt");
const displayGtBox = document.getElementById("toggleGt");
const displayConvolutionBox = document.getElementById("toggleConvolution");

plotCanvas.addEventListener("wheel", zoomPlot);

window.addEventListener("resize", resizePlotCanvas);

inputFtField.addEventListener("keydown", function(event) {
    optionsFt.value = "default"; 
    setTimeout(drawPlotCanvas, 100);
});

inputGtField.addEventListener("keydown", function(event) {
    optionsGt.value = "default"; 
    setTimeout(drawPlotCanvas, 100);
});

optionsFt.addEventListener("change", function() {
    const selection = optionsFt.value;
    inputFtField.value = dropdownFunc(selection);
    drawPlotCanvas();
});

optionsGt.addEventListener("change", function() {
    const selection = optionsGt.value;
    inputGtField.value = dropdownFunc(selection);
    drawPlotCanvas();
});

displayFtBox.addEventListener("change", (event) => {
    setTimeout(drawPlotCanvas, 100);
});

displayGtBox.addEventListener("change", (event) => {
    setTimeout(drawPlotCanvas, 100);
});

displayConvolutionBox.addEventListener("change", (event) => {
    setTimeout(drawPlotCanvas, 100);
});

resizePlotCanvas();
