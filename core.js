
const e = Math.exp(1);

function drawPlotGrid()
{
    const canvas = document.getElementById("plotCanvas");
    const ctx = canvas.getContext("2d");

    ctx.beginPath();

    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.stroke();

    const interval = Math.pow(10, Math.floor(Math.log10(plotScale) - 0.2));
    const aspect = canvas.width / canvas.height;
    const yMax = plotScale;
    const xMax = plotScale * aspect;

    for (let i = -Math.floor(16 * aspect); i <= Math.floor(16 * aspect); ++i)
    {
        if (i == 0) continue;
        const x = (canvas.width / 2) + (i * interval) * (canvas.height / (2 * plotScale));
        const y = (canvas.height / 2) - (i * interval) * (canvas.height / (2 * plotScale));
        if (x >= 0 && x < canvas.width)
        {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
        }
        if (y >= 0 && y < canvas.width)
        {
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y); 
        }
    }

    ctx.strokeStyle = "grey";
    ctx.lineWidth = 1;
    ctx.stroke();
}

function resizePlotCanvas()
{
    const canvas = document.getElementById("plotCanvas");
    const ctx = canvas.getContext("2d");

    const width = window.innerWidth;
    const height = 400;

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;

    ctx.scale(window, window.devicePixelRatio, window.devicePixelRatio);

    drawPlotCanvas();
}

function plotConvolution(f, g)
{
    const canvas = document.getElementById("plotCanvas");
    const ctx = canvas.getContext("2d");

    const aspect = canvas.width / canvas.height;
    const tMin = -aspect * plotScale;
    const deltaT = 2 * plotScale * aspect / canvas.width;
    const yMax = plotScale * (1 + 10 / canvas.height);

    f = f.replace(/\bt\b/g, "(t * deltaT + tMin)");
    g = g.replace(/\bt\b/g, "(t * deltaT + tMin)");

    const ft = Array.from({ length: canvas.width }, (_, t) => eval(f));
    const gt = Array.from({ length: canvas.width }, (_, t) => eval(g));
    console.log(gt);
    const convolution = Array.from({ length: ft.length + gt.length - 1 }, (_, t) => {
        let sum = 0;
        for (let T = Math.max(0, t - (ft.length - 1)); T <= Math.min(t, ft.length - 1); T++)
            sum += ft[t-T] * gt[T] * deltaT;
        return sum;
    });

    console.log(convolution);

    ctx.beginPath();

    let outOfBounds = false;
    for (let drawX = 0; drawX < canvas.width; drawX++)
    {
        const drawY = Math.min(Math.max(
            ((canvas.height / 2) * (1 - (convolution[drawX + ft.length / 2] / plotScale)))
        , -1), canvas.height + 1);
        if (outOfBounds && (drawY < 0 || drawY > canvas.height))
            ctx.moveTo(drawX, drawY);
        else
            ctx.lineTo(drawX, drawY);
        outOfBounds = (drawY < 0 || drawY > canvas.height);
    }
   
    ctx.strokeStyle = "cyan";
    ctx.lineWidth = 5;
    ctx.stroke();

}

function plotFunction(func, color)
{
    const canvas = document.getElementById("plotCanvas");
    const ctx = canvas.getContext("2d");

    const aspect = canvas.width / canvas.height;
    const tMin = -aspect * plotScale;
    const deltaT = 2 * plotScale * aspect / canvas.width;
    const yMax = plotScale * (1 + 10 / canvas.height);

    func = func.replace(/\bt\b/g, "(t * deltaT + tMin)")
    const y = Array.from({ length: canvas.width }, (_, t) => eval(func));

    ctx.beginPath();

    let outOfBounds = false;
    for (let drawX = 0; drawX < canvas.width; drawX++)
    {
        const drawY = Math.min(Math.max(
            ((canvas.height / 2) * (1 - (y[drawX] / plotScale)))
        , -1), canvas.height + 1);
        if (outOfBounds && (drawY < 0 || drawY > canvas.height))
            ctx.moveTo(drawX, drawY);
        else
            ctx.lineTo(drawX, drawY);
        outOfBounds = (drawY < 0 || drawY > canvas.height);
    }
   
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.stroke();
}

function drawPlotCanvas()
{
    const canvas = document.getElementById("plotCanvas");
    const ctx = canvas.getContext("2d");
    const inputFt = parse(document.getElementById("fInput").value);
    const inputGt = parse(document.getElementById("gInput").value)

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlotGrid();
    plotFunction(inputGt, "orange");
    plotFunction(inputFt, "red");
    plotConvolution(inputFt, inputGt);
}

function zoomPlot(event)
{
    const canvas = document.getElementById("plotCanvas");
    const ctx = canvas.getContext("2d");

    event.preventDefault();

    if (event.deltaY > 0)
        plotScale *= Math.max(1 + event.deltaY / 100);
    else
        plotScale /= Math.max(1 - event.deltaY / 100);

    drawPlotCanvas();
}

var plotScale = 5;

document.getElementById("plotCanvas").addEventListener("wheel", zoomPlot);

window.addEventListener("resize", resizePlotCanvas);

document.getElementById("fInput").addEventListener("keydown", function(event) {
        setTimeout(drawPlotCanvas, 100);
});

document.getElementById("gInput").addEventListener("keydown", function(event) {
        setTimeout(drawPlotCanvas, 100);
});

resizePlotCanvas();
