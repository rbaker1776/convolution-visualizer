

function get_color(style_color)
{
    return getComputedStyle(document.documentElement).getPropertyValue(style_color).trim()
}

function apply_theme(theme)
{
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById("theme-button").firstChild.src =
          theme == "light"
        ? "./static/images/sun-icon.png"
        : "./static/images/moon-icon.png";
}

function init_theme()
{
    const darkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    return darkTheme ? "dark" : "light";
}


