

class Plotter
{
    constructor(canvas)
    {
        this.redrawFunc = () => {};
        this.resize = this.resize.bind(this);
        this.redraw = this.redraw.bind(this);
        this.zoom = this.zoom.bind(this);
        this.pan = this.pan.bind(this);

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.aspectRatio = canvas.width / canvas.height;
        this.scale = 3;

        this.isPanning = false;
        this.tMin = -this.scale * this.aspectRatio * 0.5 / window.devicePixelRatio;
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

        this.ctx.strokeStyle = getColor("--axis-color");
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawGrid()
    {
        this.ctx.beginPath();

        const interval = Math.pow(10, Math.floor(Math.log10(this.scale / 2)));

        this.ctx.font = `16pt Cambria Math`;
        this.ctx.fillStyle = getColor("--grid-color");
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

        this.ctx.strokeStyle = getColor("--grid-color");
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }

    redraw()
    {
        this.redrawFunc.call(this);
    }

    resize(height)
    {
        const width = window.innerWidth;
        const p = Math.abs(this.tMin / (this.scale * this.aspectRatio));

        this.canvas.width = width * window.devicePixelRatio;
        console.log(height);
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
}


