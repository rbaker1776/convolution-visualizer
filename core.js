
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

function plotFunction(func, color)
{
    const canvas = document.getElementById("plotCanvas");
    const ctx = canvas.getContext("2d");

    const aspect = canvas.width / canvas.height;
    const tMin = -aspect * plotScale;
    const yMax = plotScale * (1 + 10 / canvas.height);
    let yPrev = 0;

    ctx.beginPath();

    for (let drawX = -1; drawX <= canvas.width + 1; drawX += 0.5)
    {
        const t = tMin + 2 * plotScale * aspect * drawX / canvas.width;
        const y = eval(func);
        const drawY = Math.min(
            Math.max(
                (canvas.height / 2) - (y * canvas.height) / (plotScale * 2),
                -1
            ),
            canvas.height + 1
        );

        if (
            (
                (drawY < 0 || drawY > canvas.height)
             && (yPrev < 0 || yPrev > canvas.height)
            )
         || drawX == -1
        )
            ctx.moveTo(drawX, drawY);
        else
            ctx.lineTo(drawX, drawY);

        yPrev = drawY;
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
