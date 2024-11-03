
class Plotter
{
    constructor(canvas, redrawFunc)
    {
        this.redrawFunc = redrawFunc;
        this.resize = this.resize.bind(this);
        this.redraw = this.redraw.bind(this);
        this.zoom = this.zoom.bind(this);
        this.pan = this.pan.bind(this);

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.aspectRatio = canvas.width / canvas.height;
        this.scale = 3;

        this.resize();

        this.isPanning = false;
        this.tMin = -this.scale * this.aspectRatio / (4 * window.devicePixelRatio);
        this.fMax = this.scale / 2;
        this.prevT = 0;
        this.prevF = 0;

        this.isDragging = false;
        this.cursorT = 1.5;
    }

    canvasXtoT(x)
    {
        return this.tMin + (x / this.canvas.width) * this.scale * this.aspectRatio;
    }

    canvasYtoF(y)
    {
        return this.fMax - (y * window.devicePixelRatio / this.canvas.height) * this.scale;
    }

    tToCanvasX(t)
    {
        return (t - this.tMin) / (this.scale * this.aspectRatio) * this.canvas.width;
    }

    fToCanvasY(f)
    {
        return (this.fMax - f) / (this.scale * window.devicePixelRatio) * this.canvas.height;
    }

    drawAxes()
    {
        this.ctx.beginPath();
        
        const drawX = this.tToCanvasX(0);
        const drawY = this.fToCanvasY(0);

        this.ctx.moveTo(drawX, 0);
        this.ctx.lineTo(drawX, this.canvas.height);
        this.ctx.moveTo(0, drawY);
        this.ctx.lineTo(this.canvas.width, drawY);

        this.ctx.strokeStyle = "white";
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawGrid()
    {
        this.ctx.beginPath();

        const interval = Math.pow(10, Math.floor(Math.log10(this.scale / 2)));

        this.ctx.font = `16pt Cambria Math`;
        this.ctx.fillStyle = "grey";
        this.ctx.textAlign = "right";

        const tiMin = Math.floor(this.tMin / interval) * interval;
        const tiMax = Math.floor(
            (this.tMin + this.scale * this.aspectRatio) / interval
        ) * interval;

        const y0 = this.fToCanvasY(0);
        const x0 = this.tToCanvasX(0);

        for (let t = tiMin; t <= tiMax; t += interval)
        {
            if (Math.abs(t) < interval / 2)
            {
                this.ctx.fillText(0, x0 - 5, y0 - 5);
                continue;
            }
            const drawX = this.tToCanvasX(t);
            this.ctx.moveTo(drawX, 0);
            this.ctx.lineTo(drawX, this.canvas.height);
            
            if (this.scale * this.aspectRatio / interval < 30)
                this.ctx.fillText(`${t}`, drawX - 5, y0 - 5)
            else if (this.scale * this.aspectRatio / interval < 60 && Math.round(t / interval) % 5 == 0)
                this.ctx.fillText(`${t}`, drawX - 5, y0 - 5)
            else if (Math.round(t / interval) % 10 == 0)
                this.ctx.fillText(`${t}`, drawX - 5, y0 - 5)
        }

        const fiMin = Math.floor((this.fMax - this.scale) / interval) * interval;
        const fiMax = Math.floor(this.fMax / interval) * interval;

        for (let f = fiMin; f <= fiMax; f += interval)
        {
            if (Math.abs(f) < interval / 2)
                continue;
            const drawY = this.fToCanvasY(f);
            this.ctx.moveTo(0, drawY);
            this.ctx.lineTo(this.canvas.width, drawY);
            
            if (this.scale / interval < 6)
                this.ctx.fillText(`${f}`, x0 - 5, drawY - 5)
            else if (this.scale / interval < 18 && Math.round(f / interval) % 2 == 0)
                this.ctx.fillText(`${f}`, x0 - 5, drawY - 5)
            else if (Math.round(f / interval) % 10 == 0)
                this.ctx.fillText(`${f}`, x0 - 5, drawY - 5)
        }

        this.ctx.strokeStyle = "grey";
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }

    plotFunction(ft, color)
    {
        let yPrev = this.fToCanvasY(ft[0]);
        this.ctx.beginPath();
        this.ctx.moveTo(-1, yPrev);

        for (let i = 0; i < ft.length; ++i)
        {
            const drawX = i;
            const drawY = Math.min(Math.max(this.fToCanvasY(ft[i]), -3), this.canvas.height + 3);
            this.ctx.lineTo(drawX, drawY);
            yPrev = drawY;
        }

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
    }

    highlightProductArea(ft, gt, color)
    {
        this.ctx.beginPath();
        const y0 = this.fToCanvasY(0);
        let sum = 0;

        for (let x = 0; x < ft.length; ++x)
        {
            if (gt[x] == 0 || ft[x] == 0)
                continue;

            const product = gt[x] * ft[x];
            this.ctx.moveTo(x, y0);
            this.ctx.lineTo(x, this.fToCanvasY(product));
            sum += product;
        }

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 0;
        this.ctx.stroke();

        return sum;
    }

    drawCursor(convolutionValue)
    {
        this.ctx.beginPath();

        const t = this.tToCanvasX(this.cursorT)
        this.ctx.moveTo(t, 0);
        this.ctx.lineTo(t, this.canvas.height);

        this.ctx.strokeStyle = "grey";
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([5,5]);

        this.ctx.stroke();
        this.ctx.setLineDash([]);

        this.ctx.beginPath();

        this.ctx.arc(t, this.fToCanvasY(convolutionValue), 6, 0, 2 * Math.PI);

        this.ctx.fillStyle = "cyan";
        this.ctx.fill();
    }

    redraw() { return this.redrawFunc.call(this); }

    resize()
    {
        const width = window.innerWidth;
        const height = 300;
        const p = Math.abs(this.tMin / (this.scale * this.aspectRatio));

        this.canvas.width = width * window.devicePixelRatio;
        this.canvas.height = height * window.devicePixelRatio;
        this.aspectRatio = width / height * window.devicePixelRatio;
        this.tMin = -p * this.scale * this.aspectRatio;

        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        this.redraw();
    }

    zoom(event)
    {
        event.preventDefault();

        const minScale = 2;
        const maxScale = 20;

        const zoomT = this.canvasXtoT(event.offsetX);
        const centerT = Math.abs(zoomT) < this.scale * this.aspectRatio / 20 ? 0 : zoomT;
        const ratioT = (centerT - this.tMin) / this.scale;

        const zoomF = this.canvasYtoF(event.offsetY);
        const centerF = Math.abs(zoomF) < this.scale / 20 ? 0 : zoomF;
        const ratioF = (this.fMax - centerF) / this.scale;

        this.scale = Math.max(Math.min(
            this.scale * (1 + event.deltaY / 200)
        , maxScale), minScale);
        
        this.tMin = centerT - ratioT * this.scale;
        this.fMax = centerF + ratioF * this.scale;

        this.redraw();
    }

    pan(event)
    {
        event.preventDefault();

        if (!this.isPanning)
            return;

        const t = this.canvasXtoT(event.offsetX);
        this.tMin += this.prevT - t;
        const f = this.canvasYtoF(event.offsetY);
        this.fMax += this.prevF - f;

        this.redraw();
    }

    moveCursor(event)
    {
        event.preventDefault();

        if (!this.isDragging)
            return;

        const t = this.canvasXtoT(event.offsetX);
        this.cursorT = t;

        this.redraw();
    }
}

const e = Math.exp(1);

const pi = Math.PI;

function dd(t, deltaT)
{
    return (
        Math.abs(t) <= Math.abs(deltaT / 2)
      ? 1 / Math.abs(deltaT)
      : 0
    );
}

function evaluate(func, tMin, tMax, deltaT)
{
    func = func.replace(/dd\(([^)]*)\)/g, (match, p1) => {
        return `dd(${p1}, deltaT)`;
    });
    func = func.replace(/\bt\b/g, "(t * deltaT + tMin)");
    return Array.from(
        { length: Math.ceil((tMax - tMin) / deltaT) },
        (_, t) => eval(func)
    );
}

function convolve(ft, gt, deltaT)
{
    return Array.from(
        { length: ft.length + gt.length - 1 },
        (_, t) => {
            let sum = 0;
            for (let T = Math.max(0, t - (ft.length - 1)); T < Math.min(t, ft.length - 1); ++T)
                sum += ft[t-T] * gt[T] * deltaT;
            return sum;
        }
    ).slice(Math.floor(ft.length / 2), Math.floor(ft.length * 3/2));
}

function dropdownSelect(selection)
{
    switch (selection)
    {
        case "unitStep":    return "u(t)";
        case "pulse":       return "u(t) * u(1-t)";
        case "impulse":     return "dd(t)";
        case "expDecay":    return "exp(-t) * u(t)";
        case "triangle":    return "(1 - abs(t-1)) * u(t) * u(2-t)";
        case "gaussian":    return "exp(-1/2 * 2*pi * t**2)"
        case "dampedSine":  return "sin(4*t) * exp(-t) * u(t)";
        case "dampedSq":    return "(-1)^floor(2*t) * exp(-floor(2*t)/2) * u(t)"
        case "biphasic":    return "exp(-t) * (u(t) * u(1-t) - u(t-1) * u(2-t))";
        case "triphasic":   return "exp(-t/2) * (u(t) * u(1-t) - u(t-1) * u(2-t) + u(t-2) * u(3-t))";
        case "pulseTrain":  return "dd(t) - dd(t-1.2) + dd(t-2.4) - dd(t-3.6) + dd(t-4.8) - dd(t-6)";
    }
}

function redrawFunctions()
{
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();
    this.drawAxes();

    const inputFt = parse(inputFtField.value);
    const inputGt = parse(inputGtField.value);

    const tMax = this.tMin + this.scale * this.aspectRatio;
    const maxAbsT = Math.max(Math.abs(this.tMin), tMax);
    const deltaT = (tMax - this.tMin) / this.canvas.width;

    const ft = evaluate(inputFt, -maxAbsT, maxAbsT, deltaT);
    const gt = evaluate(inputGt, -maxAbsT, maxAbsT, deltaT);
    const convolution = convolve(ft, gt, deltaT);
    const beginIdx = Math.max(0, this.tToCanvasX(this.tMin + maxAbsT) - this.tToCanvasX(0));

    if (displayGtBox.checked)
        this.plotFunction(gt.slice(
            Math.max(0, gt.length * (1 - (-this.tMin + tMax) / (maxAbsT + tMax))),
            Math.min(gt.length, gt.length * (tMax - this.tMin) / (maxAbsT - this.tMin))
        ), "orange");
    if (displayFtBox.checked)
        this.plotFunction(ft.slice(
            Math.max(0, ft.length * (1 - (-this.tMin + tMax) / (maxAbsT + tMax))),
            Math.min(ft.length, ft.length * (tMax - this.tMin) / (maxAbsT - this.tMin))
        ), "red");
    if (displayCvBox.checked)
        this.plotFunction(convolution.slice(beginIdx, beginIdx + this.canvas.width), "cyan");
}

function redrawSliders()
{
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();
    this.drawAxes();

    const inputFt = parse(inputFtField.value);
    const inputGt = parse(inputGtField.value);

    const tMax = this.tMin + this.scale * this.aspectRatio;
    const maxAbsT = Math.max(Math.abs(this.tMin), tMax);
    const deltaT = (tMax - this.tMin) / this.canvas.width;
    const tOffset = this.cursorT;

    const ftExtended = evaluate(inputFt, -maxAbsT, maxAbsT, deltaT);
    const gtExtended = evaluate(inputGt, -maxAbsT, maxAbsT, deltaT);
    const convolutionExt = convolve(ftExtended, gtExtended, deltaT);
    const beginIdx = Math.max(0, this.tToCanvasX(this.tMin + maxAbsT) - this.tToCanvasX(0));

    const ft = ftExtended.slice(
        Math.max(0, ftExtended.length * (1 - (-this.tMin + tMax) / (maxAbsT + tMax))),
        Math.min(ftExtended.length, ftExtended.length * (tMax - this.tMin) / (maxAbsT - this.tMin))
    );
    const gtBackwards = evaluate(inputGt, maxAbsT + tOffset, -maxAbsT + tOffset, -deltaT).slice(
        Math.max(0, gtExtended.length * (1 - (-this.tMin + tMax) / (maxAbsT + tMax))),
        Math.min(gtExtended.length, gtExtended.length * (tMax - this.tMin) / (maxAbsT - this.tMin))
    );
    const convolution = convolutionExt.slice(beginIdx, beginIdx + this.canvas.width);

    const area = this.highlightProductArea(ft, gtBackwards, "rgba(0, 255, 0, 0.3)");
    this.plotFunction(gtBackwards, "orange");
    this.plotFunction(ft, "red");
    this.plotFunction(convolution, "cyan");
    this.drawCursor(area * deltaT);
}

const inputFtField = document.getElementById("fInput");
const inputGtField = document.getElementById("gInput");

const optionsFt = document.getElementById("fOptions");
const optionsGt = document.getElementById("gOptions");

const displayFtBox = document.getElementById("toggleFt");
const displayGtBox = document.getElementById("toggleGt");
const displayCvBox = document.getElementById("toggleConvolution");

const functionPlotter = new Plotter(document.getElementById("plotCanvas"), redrawFunctions);
const slidePlotter = new Plotter(document.getElementById("slideCanvas"), redrawSliders);
const plotters = [functionPlotter, slidePlotter];

plotters.forEach((plotter, idx) => {
    plotter.canvas.addEventListener("wheel", plotter.zoom);
   
    window.addEventListener("resize", plotter.resize);
    
    plotter.resize();
});


functionPlotter.canvas.addEventListener("mousedown", (event) => {
    functionPlotter.isPanning = true;
    functionPlotter.prevT = functionPlotter.canvasXtoT(event.offsetX);
    functionPlotter.prevF = functionPlotter.canvasYtoF(event.offsetY);
});

functionPlotter.canvas.addEventListener("mouseup", () => {
    functionPlotter.isPanning = false;
});

functionPlotter.canvas.addEventListener("mouseleave", () => {
    functionPlotter.isPanning = false;
});

functionPlotter.canvas.addEventListener("mousemove", functionPlotter.pan);


slidePlotter.canvas.addEventListener("mousedown", (event) => {
    const clickT = slidePlotter.canvasXtoT(event.offsetX);
    if (Math.abs(clickT - slidePlotter.cursorT) < slidePlotter.scale * slidePlotter.aspectRatio * 0.01)
        slidePlotter.isDragging = true;
    else
        slidePlotter.isPanning = true;

    slidePlotter.prevT = clickT;
    slidePlotter.prevF = functionPlotter.canvasYtoF(event.offsetY);
});

slidePlotter.canvas.addEventListener("mouseup", () => {
    slidePlotter.isDragging = false;
    slidePlotter.isPanning = false;
});

slidePlotter.canvas.addEventListener("mouseleave", () => {
    slidePlotter.isDragging = false;
    slidePlotter.isPanning = false;
});

slidePlotter.canvas.addEventListener("mousemove", (event) => {
    if (slidePlotter.isPanning)
        slidePlotter.pan(event);
    else
        slidePlotter.moveCursor(event);
});


inputFtField.addEventListener("keydown", (event) => {
    optionsFt.value = "default";
    setTimeout(functionPlotter.redraw, 100);
    setTimeout(slidePlotter.redraw, 100);
});

inputGtField.addEventListener("keydown", (event) => {
    optionsGt.value = "default";
    setTimeout(functionPlotter.redraw, 100);
    setTimeout(slidePlotter.redraw, 100);
});

optionsFt.addEventListener("change", () => {
    const selection = optionsFt.value;
    inputFtField.value = dropdownSelect(selection);
    functionPlotter.redraw();
    slidePlotter.redraw();
});

optionsGt.addEventListener("change", () => {
    const selection = optionsGt.value;
    inputGtField.value = dropdownSelect(selection);
    functionPlotter.redraw();
    slidePlotter.redraw();
});

displayFtBox.addEventListener("change", () => {
    setTimeout(functionPlotter.redraw, 100);
    setTimeout(slidePlotter.redraw, 100);
});

displayGtBox.addEventListener("change", () => {
    setTimeout(functionPlotter.redraw, 100);
    setTimeout(slidePlotter.redraw, 100);
});

displayCvBox.addEventListener("change", () => {
    setTimeout(functionPlotter.redraw, 100);
    setTimeout(slidePlotter.redraw, 100);
});
