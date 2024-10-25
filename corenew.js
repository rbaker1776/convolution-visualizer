
function clearCanvas(canvasID)
{
    const canvas = document.getElementById(canvasID);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function resizeCanvas(canvasID)
{
    const canvas = document.getElementById(canvasID);
    const ctx = canvas.getContext("2d");

    const width = window.innerWidth;
    const height = 400;

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;

    ctx.scale(window,devicePixelRatio, window.devicePixelRatio);
}

function drawGrid(canvasID, yMax)
{
    const canvas = document.getElementById(canvasID);
    const ctx = canvas.getContext("2d");

    ctx.beginPath();

    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();

    const interval = Math.pow(10, Math.floor(Math.log10(yMax) - 0.2));
    const aspect = canvas.width / canvas.height;
    const xMax = yMax * aspect;
    
    for (let i = -Math.floor(10 * aspect); i <= Math.floor(10 * aspect); ++i)
    {
        if (i == 0)
            continue;

        const drawX = (canvas.width / 2) + (i * interval * canvas.width) / (xMax * 2);
        ctx.moveTo(drawX, 0);
        ctx.lineTo(drawX, canvas.height);

        if (Math.abs(i) * interval <= yMax)
        {
            const drawY = (canvas.height / 2) - (i * interval * canvas.width) / (yMax * 2);
            ctx.moveTo(0, drawY);
            ctx.lineTo(canvas.width, drawY);
        }
    }

    ctx.strokeStyle = "grey";
    ctx.lineWidth = 0.8;
    ctx.stroke();
}

function plotFunction(canvasID, funcInput)
{
    const canvas = document.getElementById(canvasID);
    const func = document.getElementById(funcInput).value;
    const ctx = canvas.getContext("2d");

    ctx.beginPath();
    
    const nPoint = 1000;
    const aspect = canvas.width / canvas.height;
    const tMin = -aspect * scale;
    const yMax = scale * (1 + 10 / canvas.height);
    let yPrev = 0;

    for (let i = 0; i <= nPoints; ++i)
    {
        const t = tMin + 2 * scale * aspect * i / nPoints;
        const y = Math.min(Math.max(eval(func), -yMax), yMax);

        const drawX =  (canvas.width / 2) + (t *  canvas.width) / (scale * aspect * 2);
        const drawY = (canvas.height / 2) - (y * canvas.height) / (scale * 2);
        
        if ((Math.abs(y) == yMax && Math.abs(yPrev) == yMax) || i == 0)
            ctx.moveTo(drawX, drawY);
        else
            ctx.lineTo(drawX, drawY);

        yPrev = y;
    }

    ctx.strokeStyle = "red";
    ctx.lineWidth = 5;
    ctx.stroke();
}

function zoom(event, canvasInfo)
{
    const canvas = document.getElementById(canvasID);
    const ctx = canvas.getContext("2d");

    event.preventDefault();

    if (event.deltaY > 0)
        scale *= Math.max(1 + event.deltaY / 100);
    else
        scale /= Math.max(1 - event.deltaY / 100);

    clearCanvas(canvasID);
    drawGrid(canvasID);
    plotFunction(canvasID,

    return scale;
}
