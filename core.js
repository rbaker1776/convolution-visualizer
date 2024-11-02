
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
        this.tMin = -this.scale * this.aspectRatio / 4; //-this.scale * this.aspectRatio / 2;
        this.fMax = this.scale / 2;
        this.prevT = 0;
        this.prevF = 0;
    }

    canvasXtoT(x)
    {
        return this.tMin + (x / this.canvas.width) * this.scale * this.aspectRatio;
    }

    canvasYtoF(y)
    {
        return this.fMax - (y / this.canvas.height) * this.scale;
    }

    tToCanvasX(t)
    {
        return (t - this.tMin) / (this.scale * this.aspectRatio) * this.canvas.width;
    }

    fToCanvasY(f)
    {
        return (this.fMax - f) / (this.scale) * this.canvas.height;
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
        const interval = Math.pow(10, Math.floor(Math.log10(this.scale / 2)));

        const tiMin = Math.floor(this.tMin / interval) * interval;
        const tiMax = Math.floor(
            (this.tMin + this.scale * this.aspectRatio) / interval
        ) * interval;

        for (let t = tiMin; t <= tiMax; t += interval)
        {
            if (Math.abs(t) < interval / 2)
                continue;
            const drawX = this.tToCanvasX(t);
            this.ctx.moveTo(drawX, 0);
            this.ctx.lineTo(drawX, this.canvas.height);
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

        console.log(ft.length - this.canvas.width);
        for (let i = 0; i < ft.length; ++i)
        {
            const drawX = i;
            const drawY = Math.min(Math.max(this.fToCanvasY(ft[i]), -3), this.canvas.height + 3);
            this.ctx.lineTo(drawX, drawY);
            yPrev = drawY;
        }

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 5;
        this.ctx.stroke();
    }

    redraw() { return this.redrawFunc.call(this); }

    resize()
    {
        const width = window.innerWidth;
        const height = 300;
        const p = Math.abs(this.tMin / (this.scale * this.aspectRatio));

        this.canvas.width = width * window.devicePixelRatio;
        this.canvas.height = height * window.devicePixelRatio;
        this.aspectRatio = width / height;
        this.tMin = -p * this.scale * this.aspectRatio;

        this.ctx.scale(window, window.devicePixelRatio, window.devicePixelRatio);
        
        this.redraw();
    }

    zoom(event)
    {
        event.preventDefault();

        const minScale = 2;
        const maxScale = 20;

        const zoomT = this.canvasXtoT(2 * event.offsetX);
        const centerT = Math.abs(zoomT) < this.scale * this.aspectRatio / 20 ? 0 : zoomT;
        const ratioT = (centerT - this.tMin) / this.scale;

        const zoomF = this.canvasYtoF(2 * event.offsetY);
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

        const t = this.canvasXtoT(2 * event.offsetX)
        this.tMin += this.prevT - t;
        const f = this.canvasYtoF(2 * event.offsetY)
        this.fMax += this.prevF - f;

        this.redraw();
    }
}

function evaluate(func, tMin, tMax, deltaT)
{
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

function redrawFunctions()
{
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawAxes();
    this.drawGrid();

    const inputFt = parse(inputFtField.value);
    const inputGt = parse(inputGtField.value);


    const tMax = this.tMin + this.scale * this.aspectRatio;
    const maxAbsT = Math.max(Math.abs(this.tMin), tMax);
    const deltaT = (tMax - this.tMin) / this.canvas.width;
    const ft = evaluate(inputFt, -maxAbsT, maxAbsT, deltaT);
    const gt = evaluate(inputGt, -maxAbsT, maxAbsT, deltaT);
    const convolution = convolve(ft, gt, deltaT);
    const beginIdx = Math.max(0, this.tToCanvasX(this.tMin + maxAbsT) - this.tToCanvasX(0));

    this.plotFunction(gt.slice(
        Math.max(0, gt.length * (1 - (-this.tMin + tMax) / (maxAbsT + tMax))),
        Math.min(gt.length, gt.length * (tMax - this.tMin) / (maxAbsT - this.tMin))
    ), "orange");
    this.plotFunction(ft.slice(
        Math.max(0, ft.length * (1 - (-this.tMin + tMax) / (maxAbsT + tMax))),
        Math.min(ft.length, ft.length * (tMax - this.tMin) / (maxAbsT - this.tMin))
    ), "red");
    this.plotFunction(convolution.slice(beginIdx, beginIdx + this.canvas.width), "cyan");
}

const inputFtField = document.getElementById("fInput");
const inputGtField = document.getElementById("gInput");

const functionPlotter = new Plotter(document.getElementById("plotCanvas"), redrawFunctions);
const plotters = [functionPlotter];

plotters.forEach((plotter, idx) => {
    plotter.canvas.addEventListener("wheel", plotter.zoom);

    plotter.canvas.addEventListener("mousedown", (event) => {
        plotter.isPanning = true;
        plotter.prevT = plotter.canvasXtoT(2 * event.offsetX);
        plotter.prevF = plotter.canvasYtoF(2 * event.offsetY);
    });

    plotter.canvas.addEventListener("mouseup", () => {
        plotter.isPanning = false;
    });

    plotter.canvas.addEventListener("mouseleave", () => {
        plotter.isPanning = false;
    });

    plotter.canvas.addEventListener("mousemove", plotter.pan);

    window.addEventListener("resize", plotter.resize);
    
    plotter.resize();
});
