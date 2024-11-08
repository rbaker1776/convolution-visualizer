

// CONVOLUTION SPECIFIC PLOTTER METHODS

// Plotter method
function plotFunction(func, color)
{
    let yPrev = this.fToCanvasY(func[0]);
    this.ctx.beginPath();
    this.ctx.moveTo(-1, yPrev);

    for (let i = 0; i < func.length; ++i)
    {
        const drawX = i;
        const drawY = Math.min(Math.max(this.fToCanvasY(func[i]), -3), this.canvas.height + 3);
        this.ctx.lineTo(drawX, drawY);
        yPrev = drawY;
    }

    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 4;
    this.ctx.stroke();
}

// Plotter method
function highlightProductArea(ft, gt, color)
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

// Plotter method
function drawCursor(convolutionValue)
{
    this.ctx.beginPath();

    const t = this.tToCanvasX(this.cursorT)
    this.ctx.moveTo(t, 0);
    this.ctx.lineTo(t, this.canvas.height + 3);

    this.ctx.strokeStyle = getColor("--grid-color");
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([5,5]);

    this.ctx.stroke();
    this.ctx.setLineDash([]);

    this.ctx.beginPath();

    this.ctx.arc(t, this.fToCanvasY(convolutionValue), 6, 0, 2 * Math.PI);

    this.ctx.fillStyle = getColor("--conv-color");
    this.ctx.fill();
}

// Plotter method
function moveCursor(event)
{
    event.preventDefault();

    if (!this.isDragging)
        return;

    const t = this.canvasXtoT(event.offsetX);
    this.cursorT = t;

    this.redraw();
}

// Plotter method
function redrawFunctions()
{
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();
    this.drawAxes();

    const tMax = this.tMin + this.scale * this.aspectRatio;
    const deltaT = (tMax - this.tMin) / this.canvas.width;
    const maxAbsT = Math.max(Math.abs(this.tMin), Math.abs(tMax));

    const inputFt = parseExpression(inputFtField.value, deltaT);
    const inputGt = parseExpression(inputGtField.value, deltaT);

    let ftExtended, gtExtended, convolution, ft, gt;
    const beginIdx = Math.max(0, this.tToCanvasX(this.tMin + maxAbsT) - this.tToCanvasX(0));
    const endIdx = beginIdx + this.canvas.width;

    if (inputGt != false)
    {
        gtExtended = evaluate(inputGt, -maxAbsT, maxAbsT, deltaT);
        gt = gtExtended.slice(beginIdx, endIdx);
        if (displayGtBox.checked) this.plotFunction(gt, getColor("--gt-color"));
    }
    if (inputFt != false)
    {
        ftExtended = evaluate(inputFt, -maxAbsT, maxAbsT, deltaT);
        ft = ftExtended.slice(beginIdx, endIdx);
        if (displayFtBox.checked) this.plotFunction(ft, getColor("--ft-color"))
    }
    if (inputFt != false && inputGt != false && displayCvBox.checked)
    {
        convolution = convolve(ftExtended, gtExtended, deltaT).slice(beginIdx, endIdx);
        this.plotFunction(convolution, getColor("--conv-color"));
    }
}

// Plotter method
function redrawSliders()
{
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawGrid();
    this.drawAxes();

    const tMax = this.tMin + this.scale * this.aspectRatio;
    const deltaT = (tMax - this.tMin) / this.canvas.width;
    const maxAbsT = Math.max(Math.abs(this.tMin), tMax);
    const tOffset = this.cursorT;

    const inputFt = parseExpression(inputFtField.value, deltaT);
    const inputGt = parseExpression(inputGtField.value, deltaT);

    let gtExtended, ftExtended, convolution, ft, gtBackwards, area = -1e99;
    const beginIdx = Math.max(0, this.tToCanvasX(this.tMin + maxAbsT) - this.tToCanvasX(0));
    const endIdx = beginIdx + this.canvas.width;

    if (inputFt)
    {
        ftExtended = evaluate(inputFt, -maxAbsT, maxAbsT, deltaT);
        ft = ftExtended.slice(beginIdx, endIdx);
    }
    if (inputGt)
    {
        gtExtended = evaluate(inputGt, -maxAbsT, maxAbsT, deltaT);
        gtBackwards = evaluate(inputGt, maxAbsT + tOffset, -maxAbsT + tOffset, -deltaT).slice(beginIdx, endIdx);
    }

    if (inputFt && inputGt)
    {
        convolution = convolve(ftExtended, gtExtended, deltaT).slice(beginIdx, endIdx);
        area = this.highlightProductArea(ft, gtBackwards, getColor("--area-color"));
    }
    if (inputGt) this.plotFunction(gtBackwards, getColor("--gt-color"));
    if (inputFt) this.plotFunction(ft, getColor("--ft-color"));
    if (inputFt && inputGt) this.plotFunction(convolution, getColor("--conv-color"));

    this.drawCursor(area * deltaT);
}


// DECLARE DOM ELEMENTS

const inputFtField = document.getElementById("fInput");
const inputGtField = document.getElementById("gInput");

const displayFtBox = document.getElementById("toggleFt");
const displayGtBox = document.getElementById("toggleGt");
const displayCvBox = document.getElementById("toggleConvolution");

const functionPlotter = new Plotter(document.getElementById("plotCanvas"));
const slidePlotter = new Plotter(document.getElementById("slideCanvas"));

const optionsFt = document.getElementById("fOptions");
const optionsGt = document.getElementById("gOptions");


// INITIALIZATION SCRIPT

document.addEventListener("DOMContentLoaded", () =>
{
    inputFtField.addEventListener("keydown", (event) => {
        optionsFt.value = "default";
        setTimeout(functionPlotter.redraw, 20);
        setTimeout(slidePlotter.redraw, 20);
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
    });
    displayGtBox.addEventListener("change", () => {
        setTimeout(functionPlotter.redraw, 100);
    });
    displayCvBox.addEventListener("change", () => {
        setTimeout(functionPlotter.redraw, 100);
    });

    functionPlotter.plotFunction = plotFunction;
    functionPlotter.redrawFunc = redrawFunctions;
    functionPlotter.fMax = 2;
    functionPlotter.scale = 3;
    functionPlotter.tMin = -functionPlotter.scale * functionPlotter.aspectRatio * 0.25 / window.devicePixelRatio;

    functionPlotter.canvas.addEventListener("wheel", functionPlotter.zoom);
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

    slidePlotter.plotFunction = plotFunction;
    slidePlotter.highlightProductArea = highlightProductArea;
    slidePlotter.drawCursor = drawCursor;
    slidePlotter.moveCursor = moveCursor;
    slidePlotter.redrawFunc = redrawSliders;
    slidePlotter.isDragging = false;
    slidePlotter.cursorT = 0.8;
    slidePlotter.fMax = 2;
    slidePlotter.scale = 3;
    slidePlotter.tMin = -slidePlotter.scale * slidePlotter.aspectRatio * 0.25 / window.devicePixelRatio;

    slidePlotter.canvas.addEventListener("wheel", slidePlotter.zoom);
    slidePlotter.canvas.addEventListener("mousedown", (event) => {
        const clickT = slidePlotter.canvasXtoT(event.offsetX);
        if (Math.abs(clickT - slidePlotter.cursorT) < slidePlotter.scale * slidePlotter.aspectRatio * 0.01)
            slidePlotter.isDragging = true;
        else
            slidePlotter.isPanning = true;
        slidePlotter.prevT = clickT;
        slidePlotter.prevF = slidePlotter.canvasYtoF(event.offsetY);
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

    window.addEventListener("resize", () => {
        functionPlotter.resize(300);
        slidePlotter.resize(300);
    });

    document.getElementById("themeIcon").addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme =
              currentTheme == "dark"
            ? "light"
            : "dark";
        applyTheme(newTheme);
        functionPlotter.redraw();
        slidePlotter.redraw();
    });

    applyTheme(initTheme());
    functionPlotter.resize(300);
    slidePlotter.resize(300);
});
