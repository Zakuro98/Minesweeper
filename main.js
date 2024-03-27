let game = {
    width: 5,
    height: 5,
    mines: 3,
    first_click: false,
    end: false,
    chord: "both",
    flags: 0,
    time: 0,
    cleared: 0,

    grid_value: undefined,
    grid_state: undefined,
    grid_list: undefined,
}

const number_color = [
    "#ffffff",
    "#2020df",
    "#137f13",
    "#dd2121",
    "#7f21dd",
    "#dd7c21",
    "#19aaaa",
    "#000000",
    "#808080",
]

function shuffle(array) {
    var i = array.length,
        j,
        temp
    while (--i > 0) {
        j = Math.floor(Math.random() * (i + 1))
        temp = array[j]
        array[j] = array[i]
        array[i] = temp
    }
}

function new_grid(width, height, mines) {
    game.width = width
    game.height = height
    game.mines = mines

    if (game.width < 5) game.width = 5
    if (game.width > 100) game.width = 100
    if (game.height < 5) game.height = 5
    if (game.height > 100) game.height = 100
    if (game.mines < 1) game.mines = 1
    if (game.mines > game.width * game.height - 9)
        game.mines = game.width * game.height - 9

    game.first_click = false
    game.end = false
    game.flags = 0
    game.time = 0
    game.cleared = 0

    game.grid_value = new Array(game.width)
    game.grid_state = new Array(game.width)
    game.grid_list = new Array()
    for (let i = 0; i < game.width; i++) {
        game.grid_value[i] = new Array(game.height).fill(0)
        game.grid_state[i] = new Array(game.height).fill("blank")
    }

    for (let i = 0; i < game.width; i++) {
        for (let j = 0; j < game.height; j++) {
            game.grid_list.push([i, j])
        }
    }
    shuffle(game.grid_list)

    for (let i = 0; i < game.mines; i++) {
        let rand = Math.floor(Math.random() * game.grid_list.length)
        game.grid_value[game.grid_list[rand][0]][game.grid_list[rand][1]] = 9
        game.grid_list.splice(rand, 1)
    }

    document.getElementById("main_grid").style.width = game.width * 1.5 + "em"
    document.getElementById("info_block").style.width = game.width * 1.5 + "em"
    document.getElementById("exit_block").style.width = game.width * 1.5 + "em"

    document.getElementById("main_grid").replaceChildren()

    for (let j = 0; j < game.height; j++) {
        let container = document.createElement("DIV")
        container.className = "grid_row"

        for (let i = 0; i < game.width; i++) {
            let tile = document.createElement("DIV")
            tile.id = "cell_" + i + "_" + j
            if ((i + j) % 2 === 0) {
                tile.className = "grid_cell blank even"
            } else if ((i + j) % 2 === 1) {
                tile.className = "grid_cell blank odd"
            }

            tile.addEventListener("mousedown", function (event) {
                if (event.buttons === 1) {
                    open_tile(i, j)
                    if (game.chord === "left") {
                        chord_tile(i, j)
                    }
                }
                if (event.buttons === 2) {
                    flag_tile(i, j)
                    if (game.chord === "right") {
                        chord_tile(i, j)
                    }
                }
                if (event.buttons === 3) {
                    if (game.chord === "both") {
                        chord_tile(i, j)
                    }
                }
                if (event.buttons === 4) {
                    if (game.chord === "middle") {
                        chord_tile(i, j)
                    }
                    if (i > 0) highlight_on(i - 1, j)
                    if (i < game.width - 1) highlight_on(i + 1, j)
                    if (j > 0) highlight_on(i, j - 1)
                    if (i > 0 && j > 0) highlight_on(i - 1, j - 1)
                    if (i < game.width - 1 && j > 0) highlight_on(i + 1, j - 1)
                    if (j < game.height - 1) highlight_on(i, j + 1)
                    if (i > 0 && j < game.height - 1) highlight_on(i - 1, j + 1)
                    if (i < game.width - 1 && j < game.height - 1)
                        highlight_on(i + 1, j + 1)
                }
            })
            tile.addEventListener("dblclick", function () {
                if (game.chord === "double") {
                    chord_tile(i, j)
                }
            })
            tile.addEventListener("mouseup", function (event) {
                if (event.button === 1) {
                    if (i > 0) highlight_off(i - 1, j)
                    if (i < game.width - 1) highlight_off(i + 1, j)
                    if (j > 0) highlight_off(i, j - 1)
                    if (i > 0 && j > 0) highlight_off(i - 1, j - 1)
                    if (i < game.width - 1 && j > 0) highlight_off(i + 1, j - 1)
                    if (j < game.height - 1) highlight_off(i, j + 1)
                    if (i > 0 && j < game.height - 1)
                        highlight_off(i - 1, j + 1)
                    if (i < game.width - 1 && j < game.height - 1)
                        highlight_off(i + 1, j + 1)
                }
            })
            tile.addEventListener("mouseenter", function (event) {
                if (event.buttons === 4) {
                    if (i > 0) highlight_on(i - 1, j)
                    if (i < game.width - 1) highlight_on(i + 1, j)
                    if (j > 0) highlight_on(i, j - 1)
                    if (i > 0 && j > 0) highlight_on(i - 1, j - 1)
                    if (i < game.width - 1 && j > 0) highlight_on(i + 1, j - 1)
                    if (j < game.height - 1) highlight_on(i, j + 1)
                    if (i > 0 && j < game.height - 1) highlight_on(i - 1, j + 1)
                    if (i < game.width - 1 && j < game.height - 1)
                        highlight_on(i + 1, j + 1)
                }
            })
            tile.addEventListener("mouseleave", function (event) {
                if (event.buttons === 4) {
                    if (i > 0) highlight_off(i - 1, j)
                    if (i < game.width - 1) highlight_off(i + 1, j)
                    if (j > 0) highlight_off(i, j - 1)
                    if (i > 0 && j > 0) highlight_off(i - 1, j - 1)
                    if (i < game.width - 1 && j > 0) highlight_off(i + 1, j - 1)
                    if (j < game.height - 1) highlight_off(i, j + 1)
                    if (i > 0 && j < game.height - 1)
                        highlight_off(i - 1, j + 1)
                    if (i < game.width - 1 && j < game.height - 1)
                        highlight_off(i + 1, j + 1)
                }
            })
            tile.addEventListener("contextmenu", function (event) {
                event.preventDefault()
                return false
            })
            tile.addEventListener("auxclick", function (event) {
                event.preventDefault()
                return false
            })

            let number = document.createElement("P")
            number.className = "grid_empty"
            number.id = "num_" + i + "_" + j
            number.innerText = ""
            tile.appendChild(number)

            container.appendChild(tile)
        }

        document.getElementById("main_grid").appendChild(container)
    }
}

function highlight_on(c, r) {
    if (
        game.grid_state[c][r] === "blank" ||
        (game.grid_state[c][r] === "clear" &&
            game.grid_value[c][r] > 0 &&
            game.grid_value[c][r] < 9)
    ) {
        if (
            document.getElementById("cell_" + c + "_" + r).className ===
            "grid_cell blank even"
        )
            document.getElementById("cell_" + c + "_" + r).className =
                "grid_cell blank highlight even"
        if (
            document.getElementById("cell_" + c + "_" + r).className ===
            "grid_cell blank odd"
        )
            document.getElementById("cell_" + c + "_" + r).className =
                "grid_cell blank highlight odd"
    }
}

function highlight_off(c, r) {
    if (
        game.grid_state[c][r] === "blank" ||
        (game.grid_state[c][r] === "clear" &&
            game.grid_value[c][r] > 0 &&
            game.grid_value[c][r] < 9)
    ) {
        if (
            document.getElementById("cell_" + c + "_" + r).className ===
            "grid_cell blank highlight even"
        )
            document.getElementById("cell_" + c + "_" + r).className =
                "grid_cell blank even"
        if (
            document.getElementById("cell_" + c + "_" + r).className ===
            "grid_cell blank highlight odd"
        )
            document.getElementById("cell_" + c + "_" + r).className =
                "grid_cell blank odd"
    }
}

function number_tiles() {
    for (let i = 0; i < game.width; i++) {
        for (let j = 0; j < game.height; j++) {
            if (game.grid_value[i][j] !== 9) {
                let mines = 0

                if (i > 0) {
                    if (game.grid_value[i - 1][j] === 9) mines++
                }
                if (i < game.width - 1) {
                    if (game.grid_value[i + 1][j] === 9) mines++
                }
                if (j > 0) {
                    if (game.grid_value[i][j - 1] === 9) mines++
                }
                if (i > 0 && j > 0) {
                    if (game.grid_value[i - 1][j - 1] === 9) mines++
                }
                if (i < game.width - 1 && j > 0) {
                    if (game.grid_value[i + 1][j - 1] === 9) mines++
                }
                if (j < game.height - 1) {
                    if (game.grid_value[i][j + 1] === 9) mines++
                }
                if (i > 0 && j < game.height - 1) {
                    if (game.grid_value[i - 1][j + 1] === 9) mines++
                }
                if (i < game.width - 1 && j < game.height - 1) {
                    if (game.grid_value[i + 1][j + 1] === 9) mines++
                }

                game.grid_value[i][j] = mines
            }
        }
    }
}

function move_mine(c, r) {
    if (game.grid_value[c][r] === 9) {
        let rand = Math.floor(Math.random() * game.grid_list.length)
        let tc = game.grid_list[rand][0]
        let tr = game.grid_list[rand][1]
        game.grid_value[c][r] = 0
        game.grid_value[tc][tr] = 9
        game.grid_list.splice(rand, 1)
    }
}

function open_tile(c, r) {
    if (c >= 0 && r >= 0 && c < game.width && r < game.height) {
        if (game.grid_state[c][r] === "blank" && !game.end) {
            if (game.first_click === false) {
                game.first_click = true
                for (let i = game.grid_list.length - 1; i > 0; i--) {
                    if (
                        game.grid_list[i][0] >= c - 1 &&
                        game.grid_list[i][0] <= c + 1 &&
                        game.grid_list[i][1] >= r - 1 &&
                        game.grid_list[i][1] <= r + 1
                    ) {
                        game.grid_list.splice(i, 1)
                    }
                }
                move_mine(c, r)
                if (c > 0) move_mine(c - 1, r)
                if (c < game.width - 1) move_mine(c + 1, r)
                if (r > 0) move_mine(c, r - 1)
                if (c > 0 && r > 0) move_mine(c - 1, r - 1)
                if (c < game.width - 1 && r > 0) move_mine(c + 1, r - 1)
                if (r < game.height - 1) move_mine(c, r + 1)
                if (c > 0 && r < game.height - 1) move_mine(c - 1, r + 1)
                if (c < game.width - 1 && r < game.height - 1)
                    move_mine(c + 1, r + 1)

                number_tiles()
            }

            game.grid_state[c][r] = "clear"
            game.cleared++
            if (
                game.cleared >= game.width * game.height - game.mines &&
                game.grid_value[c][r] !== 9
            ) {
                for (let i = 0; i < game.width; i++) {
                    for (let j = 0; j < game.height; j++) {
                        if (game.grid_state[i][j] !== "clear") {
                            if (game.grid_state[i][j] === "blank") {
                                flag_tile(i, j)
                            }
                            if ((i + j) % 2 === 0)
                                document.getElementById(
                                    "cell_" + i + "_" + j
                                ).className = "grid_cell finish even"
                            else if ((i + j) % 2 === 1)
                                document.getElementById(
                                    "cell_" + i + "_" + j
                                ).className = "grid_cell finish odd"
                        }
                    }
                }
                game.end = true
                let highlight = document.querySelectorAll(
                    ".grid_cell.number.even"
                )
                highlight.forEach(element => {
                    element.className = "grid_cell even"
                })
                highlight = document.querySelectorAll(".grid_cell.number.odd")
                highlight.forEach(element => {
                    element.className = "grid_cell odd"
                })
            }

            if ((r + c) % 2 === 0) {
                if (game.grid_value[c][r] > 0 && game.grid_value[c][r] < 9)
                    document.getElementById("cell_" + c + "_" + r).className =
                        "grid_cell number even"
                else
                    document.getElementById("cell_" + c + "_" + r).className =
                        "grid_cell even"
            } else if ((r + c) % 2 === 1) {
                if (game.grid_value[c][r] > 0 && game.grid_value[c][r] < 9)
                    document.getElementById("cell_" + c + "_" + r).className =
                        "grid_cell number odd"
                else
                    document.getElementById("cell_" + c + "_" + r).className =
                        "grid_cell odd"
            }
            if (game.grid_value[c][r] === 9) {
                game.end = true
                document.getElementById("num_" + c + "_" + r).className =
                    "grid_emoji"
                document.getElementById("num_" + c + "_" + r).innerText = "💥"
                let highlight = document.querySelectorAll(
                    ".grid_cell.number.even"
                )
                highlight.forEach(element => {
                    element.className = "grid_cell even"
                })
                highlight = document.querySelectorAll(".grid_cell.number.odd")
                highlight.forEach(element => {
                    element.className = "grid_cell odd"
                })
                for (let i = 0; i < game.width; i++) {
                    for (let j = 0; j < game.height; j++) {
                        if (game.grid_state[i][j] !== "clear")
                            open_tile_death(i, j)
                    }
                }
            } else if (game.grid_value[c][r] > 0) {
                document.getElementById("num_" + c + "_" + r).className =
                    "grid_number"
                document.getElementById("num_" + c + "_" + r).style.color =
                    number_color[game.grid_value[c][r]]
                document.getElementById("num_" + c + "_" + r).innerText =
                    game.grid_value[c][r]
            } else if (game.grid_value[c][r] === 0) {
                document.getElementById("num_" + c + "_" + r).className =
                    "grid_empty"
                document.getElementById("num_" + c + "_" + r).innerText = ""
                window.setTimeout(function () {
                    open_tile(c - 1, r)
                }, 0)
                window.setTimeout(function () {
                    open_tile(c + 1, r)
                }, 0)
                window.setTimeout(function () {
                    open_tile(c, r - 1)
                }, 0)
                window.setTimeout(function () {
                    open_tile(c - 1, r - 1)
                }, 0)
                window.setTimeout(function () {
                    open_tile(c + 1, r - 1)
                }, 0)
                window.setTimeout(function () {
                    open_tile(c, r + 1)
                }, 0)
                window.setTimeout(function () {
                    open_tile(c - 1, r + 1)
                }, 0)
                window.setTimeout(function () {
                    open_tile(c + 1, r + 1)
                }, 0)
            }
        }
    }
}

function open_tile_death(c, r) {
    if (game.grid_state[c][r] === "blank") {
        game.grid_state[c][r] = "clear"
        if ((r + c) % 2 === 0) {
            document.getElementById("cell_" + c + "_" + r).className =
                "grid_cell even"
        } else if ((r + c) % 2 === 1) {
            document.getElementById("cell_" + c + "_" + r).className =
                "grid_cell odd"
        }
        if (game.grid_value[c][r] === 9) {
            document.getElementById("num_" + c + "_" + r).className =
                "grid_emoji"
            document.getElementById("num_" + c + "_" + r).innerText = "💣"
        } else if (game.grid_value[c][r] > 0) {
            document.getElementById("num_" + c + "_" + r).className =
                "grid_number"
            document.getElementById("num_" + c + "_" + r).style.color =
                number_color[game.grid_value[c][r]]
            document.getElementById("num_" + c + "_" + r).innerText =
                game.grid_value[c][r]
        } else if (game.grid_value[c][r] === 0) {
            document.getElementById("num_" + c + "_" + r).className =
                "grid_empty"
            document.getElementById("num_" + c + "_" + r).innerText = ""
        }
    } else if (game.grid_state[c][r] === "flag") {
        game.grid_state[c][r] === "clear"
        if ((r + c) % 2 === 0) {
            document.getElementById("cell_" + c + "_" + r).className =
                "grid_cell even"
        } else if ((r + c) % 2 === 1) {
            document.getElementById("cell_" + c + "_" + r).className =
                "grid_cell odd"
        }
        document.getElementById("num_" + c + "_" + r).className = "grid_emoji"
        if (game.grid_value[c][r] === 9) {
            document.getElementById("num_" + c + "_" + r).innerText = "✔️"
        } else {
            document.getElementById("num_" + c + "_" + r).innerText = "❌"
        }
    }
}

function flag_tile(c, r) {
    if (!game.end) {
        if (game.grid_state[c][r] === "blank") {
            game.grid_state[c][r] = "flag"
            game.flags++
            document.getElementById("num_" + c + "_" + r).className =
                "grid_emoji"
            document.getElementById("num_" + c + "_" + r).innerText = "🚩"
        } else if (game.grid_state[c][r] === "flag") {
            game.grid_state[c][r] = "blank"
            game.flags--
            document.getElementById("num_" + c + "_" + r).className =
                "grid_empty"
            document.getElementById("num_" + c + "_" + r).innerText = ""
        }
    }
}

function chord_tile(c, r) {
    if (game.grid_state[c][r] === "clear" && !game.end) {
        let flags = 0

        if (c > 0) {
            if (game.grid_state[c - 1][r] === "flag") flags++
        }
        if (c < game.width - 1) {
            if (game.grid_state[c + 1][r] === "flag") flags++
        }
        if (r > 0) {
            if (game.grid_state[c][r - 1] === "flag") flags++
        }
        if (c > 0 && r > 0) {
            if (game.grid_state[c - 1][r - 1] === "flag") flags++
        }
        if (c < game.width - 1 && r > 0) {
            if (game.grid_state[c + 1][r - 1] === "flag") flags++
        }
        if (r < game.height - 1) {
            if (game.grid_state[c][r + 1] === "flag") flags++
        }
        if (c > 0 && r < game.height - 1) {
            if (game.grid_state[c - 1][r + 1] === "flag") flags++
        }
        if (c < game.width - 1 && r < game.height - 1) {
            if (game.grid_state[c + 1][r + 1] === "flag") flags++
        }

        if (game.grid_value[c][r] === flags) {
            window.setTimeout(function () {
                open_tile(c - 1, r)
            }, 0)
            window.setTimeout(function () {
                open_tile(c + 1, r)
            }, 0)
            window.setTimeout(function () {
                open_tile(c, r - 1)
            }, 0)
            window.setTimeout(function () {
                open_tile(c - 1, r - 1)
            }, 0)
            window.setTimeout(function () {
                open_tile(c + 1, r - 1)
            }, 0)
            window.setTimeout(function () {
                open_tile(c, r + 1)
            }, 0)
            window.setTimeout(function () {
                open_tile(c - 1, r + 1)
            }, 0)
            window.setTimeout(function () {
                open_tile(c + 1, r + 1)
            }, 0)
        }
    }
}

function board_setup() {
    game.end = true
    document.getElementById("setup_panel").style.display = "block"
    document.getElementById("game_panel").style.display = "none"
}

function begin() {
    document.getElementById("game_panel").style.display = "block"
    document.getElementById("setup_panel").style.display = "none"
    new_grid(
        Number(document.getElementById("width").value),
        Number(document.getElementById("height").value),
        Number(document.getElementById("mines").value)
    )
    document.documentElement.style.setProperty(
        "--hue",
        Number(document.getElementById("hue").value)
    )
    game.chord = document.getElementById("chord").value
}

function format_time(time) {
    if (time < 60) {
        return time.toFixed(2)
    } else if (time < 3600) {
        let minute_colon = ":"
        if (time % 60 < 10) minute_colon = ":0"
        return Math.floor(time / 60) + minute_colon + (time % 60).toFixed(2)
    } else {
        let minute_colon = ":"
        if (time % 60 < 10) minute_colon = ":0"
        let hour_colon = ":"
        if (Math.floor(time / 60) % 60 < 10) hour_colon = ":0"
        return (
            Math.floor(time / 3600) +
            hour_colon +
            (Math.floor(time / 60) % 60) +
            minute_colon +
            (time % 60).toFixed(2)
        )
    }
}

function time_update() {
    if (!game.end && game.first_click)
        game.time += (Date.now() - time_last) / 1000
    time_last = Date.now()

    document.getElementById("game_flags").innerText =
        "🚩 " + (game.mines - game.flags)
    document.getElementById("game_time").innerText =
        "⏱️ " + format_time(game.time)

    let size =
        Number(document.getElementById("width").value) *
        Number(document.getElementById("height").value)
    document.getElementById("mines").max = size - 9
    let density = (19 + size ** 0.5) / 200
    if (density > 0.25) density = 0.25
    document.getElementById("max_mines").innerHTML =
        "(max: " +
        (size - 9) +
        ") (suggested: " +
        Math.floor(size * density) +
        ")"
    document.getElementById("mine_density").innerHTML =
        "Density: " +
        ((Number(document.getElementById("mines").value) * 100) / size).toFixed(
            1
        ) +
        "%"
    document.getElementById("hue").style.color =
        "hsl(" + Number(document.getElementById("hue").value) + ",100%,50%)"
}

new_grid(15, 10, 23)

let time_last = Date.now()
window.setInterval(time_update, 10)

document.getElementById("main_grid").onmousedown = function (event) {
    if (event.button == 1) {
        event.preventDefault()
        return false
    }
}
