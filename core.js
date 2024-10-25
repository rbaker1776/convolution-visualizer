
var scale = 5;

function resizeCanvas()
{
    const canvas = document.getElementById("plotCanvas");
    const ctx = canvas.getContext("2d");

    const width = window.innerWidth;
    const height = 400;

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;

    ctx.scale(window,devicePixelRatio, window.devicePixelRatio);

    plotFunction();
}

function drawAxes()
{
    const canvas = document.getElementById("plotCanvas");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();

    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();

    const interval = Math.pow(10, Math.floor(Math.log10(scale) - 0.2));
    const yMax = scale;
    const aspect = canvas.width / canvas.height;
    const xMax = scale * aspect;

    for (let y = -interval * 16; y <= interval * 16; y += interval)
    {
        if (y > yMax || y < -yMax || Math.abs(y) * 2 < interval)
            continue;
        const drawY = (canvas.height / 2) - (y * canvas.height) / (scale * 2);
        ctx.moveTo(0, drawY);
        ctx.lineTo(canvas.width, drawY);
    }

    for (let x = -interval * Math.floor(16 * aspect); x <= interval * Math.floor(16 * aspect); x += interval)
    {
        if (x > xMax || x < -xMax || Math.abs(x) * 2 < interval)
            continue;
        const drawX = (canvas.width / 2) + (x * canvas.width) / (scale * aspect * 2);
        ctx.moveTo(drawX, 0);
        ctx.lineTo(drawX, canvas.height);
    }

    ctx.strokeStyle = "grey";
    ctx.lineWidth = 1;
    ctx.stroke();
}

function plotFunction()
{
    const canvas = document.getElementById("plotCanvas");
    const ctx = canvas.getContext("2d");
    const inputFx = document.getElementById("functionInput").value;

    drawAxes();
    ctx.beginPath();

    const nPoints = canvas.width;
    const aspect = canvas.width / canvas.height;
    const tMin = -aspect * scale;
    const yMax = scale * (1 + 10 / canvas.height);
    let yPrev = 0;

    for (let i = 0; i <= nPoints; i++)
    {
        const t = tMin + 2 * scale * aspect * i / nPoints;
        const y = Math.min(Math.max(eval(inputFx), -yMax), yMax);
        const drawX =  (canvas.width / 2) + (t *  canvas.width) / (scale * aspect * 2);
        const drawY = (canvas.height / 2) - (y * canvas.height) / (scale * 2);
        
        if (Math.abs(y) == yMax && Math.abs(yPrev) == yMax)
            ctx.moveTo(drawX, drawY);
        else
            ctx.lineTo(drawX, drawY);

        yPrev = y;
    }

    ctx.strokeStyle = "red";
    ctx.lineWidth = 5;
    ctx.stroke();
}

function zoom(event)
{
    const canvas = document.getElementById("plotCanvas");
    const ctx = canvas.getContext("2d");

    event.preventDefault();

    if (event.deltaY > 0)
        scale *= Math.max(1 + event.deltaY / 100);
    else
        scale /= Math.max(1 - event.deltaY / 100);

    plotFunction();
}

document.getElementById("plotCanvas").addEventListener("wheel", zoom);

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
