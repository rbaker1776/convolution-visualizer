

function getColor(styleColor)
{
    return getComputedStyle(document.documentElement).getPropertyValue(styleColor).trim()
}

function applyTheme(theme)
{
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById("themeButton").firstChild.src =
          theme == "light"
        ? "./static/images/sun-icon.png"
        : "./static/images/moon-icon.png";
}

function initTheme()
{
    const darkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return darkTheme ? "dark" : "light";
}


