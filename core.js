


const inputFtField = document.getElementById("fInput");
const inputGtField = document.getElementById("gInput");


class Plotter
{
    constructor(canvas, redrawFunc)
    {
        this.redrawFunc = redrawFunc;
        this.resize = this.resize.bind(this);
        this.redraw = this.redraw.bind(this);
        this.zoom = this.zoom.bind(this);

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.aspectRatio = canvas.width / canvas.height;
        this.scale = 3;

        this.resize();

        this.isPanning = false;
        this.tMin = -this.scale * this.aspectRatio / 2;
        this.fMax = this.scale / 2;
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
        console.log(p);

        this.ctx.scale(window, window.devicePixelRatio, window.devicePixelRatio);
        
        this.redraw();
    }

    zoom(event)
    {
        event.preventDefault();

        const minScale = 2;
        const maxScale = 20;

        this.scale = Math.max(Math.min(
                         this.scale * (1 + event.deltaY / 200)
                     , maxScale), minScale);
        this.tMin = -this.scale * this.aspectRatio / 2;
        this.fMax = this.scale / 2;

        this.redraw();
    }
}

function redrawFunctions()
{
    const inputFt = parse(inputFtField.value);
    const inputGt = parse(inputGtField.value);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawAxes();
    this.drawGrid();
}

const functionPlotter = new Plotter(document.getElementById("plotCanvas"), redrawFunctions);
const plotters = [functionPlotter];

plotters.forEach((plotter, idx) => {
    plotter.canvas.addEventListener("wheel", plotter.zoom);

    window.addEventListener("resize", plotter.resize);
    
    plotter.resize();
});
