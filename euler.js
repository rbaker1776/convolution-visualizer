

// Plotter method
function drawPath()
{
    this.ctx.beginPath();

    const z = new Complex(this.cursorT, this.cursorF);
    let drawZ = new Complex(1, 0);
    const iter = 20000;
    const mult = new Complex(1, 0).add(z.divide(new Complex(iter, 0)));
    this.ctx.moveTo(this.tToCanvasX(1), this.fToCanvasY(0));

    for (let i = 0; i < iter; ++i)
    {
        drawZ = drawZ.multiply(mult);
        this.ctx.lineTo(this.tToCanvasX(drawZ.real), this.fToCanvasY(drawZ.imag));
    }

    this.ctx.strokeStyle = getColor("--path-color");
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
}

// Plotter method
function drawCursor()
{
    this.ctx.beginPath();

    const x = this.tToCanvasX(this.cursorT)
    const y = this.fToCanvasY(this.cursorF)

    this.ctx.arc(x, y, 5, 0, 2 * Math.PI);

    this.ctx.fillStyle = getColor("--ft-color");
    this.ctx.fill();
}

// Plotter method
function drawCircle()
{
    this.ctx.beginPath();
    
    const radius = this.tToCanvasX(Math.exp(this.cursorT)) - this.tToCanvasX(0);

    this.ctx.arc(this.tToCanvasX(0), this.fToCanvasY(0), radius, 0, 2 * Math.PI);

    this.ctx.strokeStyle = getColor("--grid-color");
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([5,5]);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
}

// Plotter method
function moveCursor(event)
{
    event.preventDefault();

    if (this.isDraggingT)
        this.cursorT = this.canvasXtoT(event.offsetX);
    if (this.isDraggingF)
        this.cursorF = this.canvasYtoF(event.offsetY);

    this.redraw();
}

// Plotter method
function redrawMain()
{
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();
    this.drawAxes();
    this.drawCircle();

    this.drawPath();
    this.drawCursor();
}


// DECLARE DOM ELEMENTS

const mainPlotter = new Plotter(document.getElementById("mainCanvas"));


// INITIALIZATION SCRIPT

document.addEventListener("DOMContentLoaded", () =>
{
    mainPlotter.drawPath = drawPath;
    mainPlotter.drawCursor = drawCursor;
    mainPlotter.moveCursor = moveCursor;
    mainPlotter.drawCircle = drawCircle;
    mainPlotter.redrawFunc = redrawMain;
    mainPlotter.scale = 4;
    mainPlotter.fMax = 2;
    mainPlotter.tMin = mainPlotter.scale * mainPlotter.aspectRatio * 0.5 / window.devicePixelRatio;
    mainPlotter.cursorT = 0;
    mainPlotter.cursorF = 1;
    mainPlotter.isDraggingT = false;
    mainPlotter.isDraggingF = false;

    mainPlotter.canvas.addEventListener("wheel", mainPlotter.zoom);
    mainPlotter.canvas.addEventListener("mousedown", (event) => {
        const clickT = mainPlotter.canvasXtoT(event.offsetX);
        const clickF = mainPlotter.canvasYtoF(event.offsetY);
        
        if (Math.abs(clickT - mainPlotter.cursorT) < mainPlotter.scale * mainPlotter.aspectRatio * 0.02)
            mainPlotter.isDraggingT = true;
        if (Math.abs(clickF - mainPlotter.cursorF) < mainPlotter.scale * 0.02)
            mainPlotter.isDraggingF = true;
        if (!mainPlotter.isDraggingT && !mainPlotter.isDraggingF)
            mainPlotter.isPanning = true;

        mainPlotter.prevT = clickT;
        mainPlotter.prevF = clickF;
    });
    mainPlotter.canvas.addEventListener("mouseup", () => {
        mainPlotter.isPanning = false;
        mainPlotter.isDraggingF = false;
        mainPlotter.isDraggingT = false;
    });
    mainPlotter.canvas.addEventListener("mouseleave", () => {
        mainPlotter.isPanning = false;
        mainPlotter.isDraggingF = false;
        mainPlotter.isDraggingT = false;
    });
    mainPlotter.canvas.addEventListener("mousemove", (event) => {
        if (mainPlotter.isPanning)
            mainPlotter.pan(event);
        else
            mainPlotter.moveCursor(event);
    });

    window.addEventListener("resize", () => {
        mainPlotter.resize(500);
    });

    document.getElementById("themeIcon").addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme =
              currentTheme == "dark"
            ? "light"
            : "dark";
        applyTheme(newTheme);
        mainPlotter.redraw();
    });

    applyTheme(initTheme());
    mainPlotter.resize(500);
});

