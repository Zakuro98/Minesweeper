let game = {
    width: 5,
    height: 5,
    mines: 3,
    difficulty: 1,
    first_click: false,
    generating: false,
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

function for_each_neighbor(c, r, callback) {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (i === 0 && j === 0) continue
            const nc = c + i
            const nr = r + j
            if (nc >= 0 && nc < game.width && nr >= 0 && nr < game.height) {
                callback(nc, nr)
            }
        }
    }
}

function new_grid(width, height, mines) {
    game.width = width
    game.height = height
    game.mines = mines

    if (game.width < 5) game.width = 5
    if (game.width > 50) game.width = 50
    if (game.height < 5) game.height = 5
    if (game.height > 25) game.height = 25
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
                    for_each_neighbor(i, j, highlight_on)
                }
            })
            tile.addEventListener("dblclick", function () {
                if (game.chord === "double") {
                    chord_tile(i, j)
                }
            })
            tile.addEventListener("mouseup", function (event) {
                if (event.button === 1) {
                    for_each_neighbor(i, j, highlight_off)
                }
            })
            tile.addEventListener("mouseenter", function (event) {
                if (event.buttons === 4) {
                    for_each_neighbor(i, j, highlight_on)
                }
            })
            tile.addEventListener("mouseleave", function (event) {
                if (event.buttons === 4) {
                    for_each_neighbor(i, j, highlight_off)
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

function count_neighbor_mines(grid_value, c, r) {
    let count = 0
    for_each_neighbor(c, r, (nc, nr) => {
        if (grid_value[nc][nr] === 9) count++
    })
    return count
}

function count_neighbor_flags(grid_state, c, r) {
    let count = 0
    for_each_neighbor(c, r, (nc, nr) => {
        if (grid_state[nc][nr] === "flag") count++
    })
    return count
}

function count_neighbor_blanks(grid_state, c, r) {
    let count = 0
    for_each_neighbor(c, r, (nc, nr) => {
        if (grid_state[nc][nr] === "blank") count++
    })
    return count
}

function simulate_open(grid_value, grid_state, c, r) {
    const stack = [[c, r]]
    while (stack.length > 0) {
        const [cc, rr] = stack.pop()
        if (grid_state[cc][rr] !== "blank") continue
        if (grid_value[cc][rr] === 9) continue

        grid_state[cc][rr] = "clear"

        if (grid_value[cc][rr] === 0) {
            for_each_neighbor(cc, rr, (nc, nr) => {
                stack.push([nc, nr])
            })
        }
    }
}

//solver layer 0: trivial mine counting
function layer_0(grid_value, state, total_mines) {
    let flag_count = 0
    let blank_count = 0
    for (let i = 0; i < game.width; i++) {
        for (let j = 0; j < game.height; j++) {
            if (state[i][j] === "flag") flag_count++
            else if (state[i][j] === "blank") blank_count++
        }
    }
    const mines_remaining = total_mines - flag_count

    if (blank_count === 0) return false

    //if remaining mines = 0: all blanks are safe
    if (mines_remaining === 0) {
        for (let i = 0; i < game.width; i++) {
            for (let j = 0; j < game.height; j++) {
                if (state[i][j] === "blank") {
                    simulate_open(grid_value, state, i, j)
                }
            }
        }
        return true
    }

    //if remaining mines = remaining blanks: all blanks are mines
    if (mines_remaining === blank_count) {
        for (let i = 0; i < game.width; i++) {
            for (let j = 0; j < game.height; j++) {
                if (state[i][j] === "blank") {
                    state[i][j] = "flag"
                }
            }
        }
        return true
    }

    return false
}

//solver layer 1: single digit logic
function layer_1(grid_value, state) {
    let progress = false

    for (let i = 0; i < game.width; i++) {
        for (let j = 0; j < game.height; j++) {
            if (state[i][j] !== "clear") continue
            const value = grid_value[i][j]
            if (value === 0 || value === 9) continue

            const flags = count_neighbor_flags(state, i, j)
            const blanks = count_neighbor_blanks(state, i, j)

            //if blanks+flags = value: all blanks are mines
            if (value === blanks + flags && blanks > 0) {
                for_each_neighbor(i, j, (nc, nr) => {
                    if (state[nc][nr] === "blank") {
                        state[nc][nr] = "flag"
                        progress = true
                    }
                })
            }

            //if flags = value: all blanks are safe
            if (value === flags && blanks > 0) {
                for_each_neighbor(i, j, (nc, nr) => {
                    if (state[nc][nr] === "blank") {
                        simulate_open(grid_value, state, nc, nr)
                        progress = true
                    }
                })
            }
        }
    }

    return progress
}

//solver layer 2: subset deduction
function layer_2(grid_value, state) {
    let progress = false

    //collect all clues: digit tiles with at least 1 blank
    const active = []
    for (let i = 0; i < game.width; i++) {
        for (let j = 0; j < game.height; j++) {
            if (state[i][j] !== "clear") continue
            const value = grid_value[i][j]
            if (value === 0 || value === 9) continue

            const unknowns = []
            for_each_neighbor(i, j, (nc, nr) => {
                if (state[nc][nr] === "blank") unknowns.push([nc, nr])
            })
            if (unknowns.length === 0) continue

            const remaining = value - count_neighbor_flags(state, i, j)
            active.push({ c: i, r: j, unknowns, remaining })
        }
    }

    //check all ordered pairs
    for (let i = 0; i < active.length; i++) {
        for (let j = 0; j < active.length; j++) {
            if (i === j) continue
            const a = active[i]
            const b = active[j]

            if (Math.abs(a.c - b.c) > 2 || Math.abs(a.r - b.r) > 2) continue

            const subset = a.unknowns.every(([ac, ar]) =>
                b.unknowns.some(([bc, br]) => bc === ac && br === ar),
            )
            if (!subset) continue

            const extras = b.unknowns.filter(
                ([bc, br]) =>
                    !a.unknowns.some(([ac, ar]) => ac === bc && ar === br),
            )
            if (extras.length === 0) continue

            const diff = b.remaining - a.remaining

            if (diff === extras.length) {
                //all extras are mines
                for (const [ec, er] of extras) {
                    if (state[ec][er] === "blank") {
                        state[ec][er] = "flag"
                        progress = true
                    }
                }
            } else if (diff === 0) {
                //all extras are safe
                for (const [ec, er] of extras) {
                    if (state[ec][er] === "blank") {
                        simulate_open(grid_value, state, ec, er)
                        progress = true
                    }
                }
            }
        }
    }

    return progress
}

//solver layer 3: general mine counting
function layer_3(grid_value, state, total_mines) {
    let flag_count = 0
    for (let i = 0; i < game.width; i++) {
        for (let j = 0; j < game.height; j++) {
            if (state[i][j] === "flag") flag_count++
        }
    }
    const mines_remaining = total_mines - flag_count
    if (mines_remaining <= 0) return false

    function constraint_key(unknowns, need) {
        const sorted = unknowns
            .map(([c, r]) => c * 10000 + r)
            .sort((a, b) => a - b)
        return sorted.join(",") + ":" + need
    }

    function subset_extras(a_unknowns, b_unknowns) {
        if (a_unknowns.length >= b_unknowns.length) return null
        const b_set = new Set(b_unknowns.map(([c, r]) => c + "," + r))
        for (const [c, r] of a_unknowns) {
            if (!b_set.has(c + "," + r)) return null
        }

        const a_set = new Set(a_unknowns.map(([c, r]) => c + "," + r))
        return b_unknowns.filter(([c, r]) => !a_set.has(c + "," + r))
    }

    //build initial constraint pool from digit clues
    const pool = []
    const pool_keys = new Set()

    for (let i = 0; i < game.width; i++) {
        for (let j = 0; j < game.height; j++) {
            if (state[i][j] !== "clear") continue
            const value = grid_value[i][j]
            if (value === 0 || value === 9) continue

            const unknowns = []
            let flags = 0
            for_each_neighbor(i, j, (nc, nr) => {
                if (state[nc][nr] === "blank") unknowns.push([nc, nr])
                else if (state[nc][nr] === "flag") flags++
            })
            if (unknowns.length === 0) continue

            const need = value - flags
            if (need <= 0) continue
            if (need > unknowns.length) continue

            const key = constraint_key(unknowns, need)
            if (pool_keys.has(key)) continue
            pool.push({ unknowns, need, key })
            pool_keys.add(key)
        }
    }

    if (pool.length === 0) return false

    //chain derivation loop
    const derive_budget = 1000
    let derive_remaining = derive_budget

    const to_open = new Set()
    const to_flag = new Set()

    let processed = 0

    function handle_subset(a, b) {
        const extras = subset_extras(a.unknowns, b.unknowns)
        if (extras === null) return
        if (extras.length === 0) return

        const diff = b.need - a.need

        //definite deduction: all extras are safe
        if (diff === 0) {
            for (const [c, r] of extras) {
                to_open.add(c + "," + r)
            }
            return
        }

        //definite deduction: all extras are mines
        if (diff === extras.length) {
            for (const [c, r] of extras) {
                to_flag.add(c + "," + r)
            }
            return
        }

        //indefinite: derive a new group
        if (diff < 0 || diff > extras.length) return
        if (derive_remaining <= 0) return

        const key = constraint_key(extras, diff)
        if (pool_keys.has(key)) return

        pool.push({ unknowns: extras, need: diff, key })
        pool_keys.add(key)
        derive_remaining--
    }

    //main loop: process each constraint against all previously-processed ones
    while (processed < pool.length && derive_remaining > 0) {
        const current = pool[processed]

        for (let i = 0; i < processed; i++) {
            const other = pool[i]
            handle_subset(other, current)
            handle_subset(current, other)

            if (derive_remaining <= 0) break
            if (to_open.size > 0 || to_flag.size > 0) break
        }

        if (to_open.size > 0 || to_flag.size > 0) break

        processed++
    }

    //apply definite deductions from derivation
    let progress = false

    for (const key of to_open) {
        const [c, r] = key.split(",").map(Number)
        if (state[c][r] === "blank") {
            simulate_open(grid_value, state, c, r)
            progress = true
        }
    }
    for (const key of to_flag) {
        const [c, r] = key.split(",").map(Number)
        if (state[c][r] === "blank") {
            state[c][r] = "flag"
            progress = true
        }
    }

    if (progress) return true

    //disjoint sum search across the expanded pool
    let total_need = 0
    for (const c of pool) total_need += c.need
    if (total_need < mines_remaining) return false

    const search_pool = pool.slice().sort((a, b) => b.need - a.need)

    const suffix_sum = new Array(search_pool.length + 1).fill(0)
    for (let i = search_pool.length - 1; i >= 0; i--) {
        suffix_sum[i] = suffix_sum[i + 1] + search_pool[i].need
    }

    const branch_budget = 5000
    let branches = branch_budget
    let aborted = false
    const used = new Set()

    function search(target, idx) {
        if (aborted) return null
        if (branches <= 0) {
            aborted = true
            return null
        }
        branches--

        if (target === 0) return []
        if (target < 0) return null
        if (idx >= search_pool.length) return null
        if (target > suffix_sum[idx]) return null

        const clue = search_pool[idx]

        if (clue.need <= target) {
            const overlaps = clue.unknowns.some(([c, r]) =>
                used.has(c + "," + r),
            )
            if (!overlaps) {
                for (const [c, r] of clue.unknowns) used.add(c + "," + r)
                const result = search(target - clue.need, idx + 1)
                if (result !== null) return [clue, ...result]
                for (const [c, r] of clue.unknowns) used.delete(c + "," + r)
                if (aborted) return null
            }
        }

        return search(target, idx + 1)
    }

    const found_set = search(mines_remaining, 0)
    if (aborted || found_set === null) return false

    const covered = new Set()
    for (const clue of found_set) {
        for (const [c, r] of clue.unknowns) {
            covered.add(c + "," + r)
        }
    }

    for (let i = 0; i < game.width; i++) {
        for (let j = 0; j < game.height; j++) {
            if (state[i][j] === "blank" && !covered.has(i + "," + j)) {
                simulate_open(grid_value, state, i, j)
                progress = true
            }
        }
    }

    return progress
}

//solver layer 4: tank solving
function can_still_satisfy(clue_data, assignment, next_idx) {
    for (const clue of clue_data) {
        let mines_so_far = 0
        let remaining = 0
        for (const li of clue.indices) {
            if (li < next_idx) {
                if (assignment[li] === 1) mines_so_far++
            } else {
                remaining++
            }
        }

        if (mines_so_far > clue.need) return false
        if (mines_so_far + remaining < clue.need) return false
    }
    return true
}

function layer_4(grid_value, state) {
    const branch_budget = 10000
    let branches
    let aborted

    //collect frontier unknowns and clues
    const unknown_key = (c, r) => c + "," + r
    const frontier_unknowns_set = new Set()
    const clue_list = []

    for (let i = 0; i < game.width; i++) {
        for (let j = 0; j < game.height; j++) {
            if (state[i][j] !== "clear") continue
            const value = grid_value[i][j]
            if (value === 0 || value === 9) continue

            const unknowns = []
            let flags = 0
            for_each_neighbor(i, j, (nc, nr) => {
                if (state[nc][nr] === "blank") unknowns.push([nc, nr])
                else if (state[nc][nr] === "flag") flags++
            })
            if (unknowns.length === 0) continue

            const need = value - flags
            clue_list.push({ unknowns, need })

            for (const [uc, ur] of unknowns) {
                frontier_unknowns_set.add(unknown_key(uc, ur))
            }
        }
    }

    if (clue_list.length === 0) return false

    //find connected components
    const unknown_to_clues = new Map()
    for (let i = 0; i < clue_list.length; i++) {
        for (const [c, r] of clue_list[i].unknowns) {
            const k = unknown_key(c, r)
            if (!unknown_to_clues.has(k)) unknown_to_clues.set(k, [])
            unknown_to_clues.get(k).push(i)
        }
    }

    const clue_component = new Array(clue_list.length).fill(-1)
    const components = []

    for (let start = 0; start < clue_list.length; start++) {
        if (clue_component[start] !== -1) continue

        const comp_id = components.length
        const comp_clues = []
        const comp_unknowns_set = new Set()
        const queue = [start]
        clue_component[start] = comp_id

        while (queue.length > 0) {
            const ci = queue.shift()
            comp_clues.push(ci)
            for (const [c, r] of clue_list[ci].unknowns) {
                const k = unknown_key(c, r)
                if (!comp_unknowns_set.has(k)) {
                    comp_unknowns_set.add(k)
                    for (const other of unknown_to_clues.get(k)) {
                        if (clue_component[other] === -1) {
                            clue_component[other] = comp_id
                            queue.push(other)
                        }
                    }
                }
            }
        }

        const comp_unknowns = [...comp_unknowns_set].map(k => {
            const [c, r] = k.split(",").map(Number)
            return [c, r]
        })

        components.push({
            clues: comp_clues.map(i => clue_list[i]),
            unknowns: comp_unknowns,
        })
    }

    //enumerate each component and find forced tiles
    let progress = false

    for (const comp of components) {
        const n = comp.unknowns.length

        const mine_counts = new Array(n).fill(0)
        let total_valid = 0

        const local_idx = new Map()
        for (let i = 0; i < n; i++) {
            local_idx.set(
                unknown_key(comp.unknowns[i][0], comp.unknowns[i][1]),
                i,
            )
        }

        const comp_clue_data = comp.clues.map(clue => ({
            need: clue.need,
            indices: clue.unknowns.map(([c, r]) =>
                local_idx.get(unknown_key(c, r)),
            ),
        }))

        const assignment = new Array(n).fill(0)

        function enumerate(idx) {
            if (aborted) return
            if (branches <= 0) {
                aborted = true
                return
            }
            branches--

            if (idx === n) {
                for (const clue of comp_clue_data) {
                    let mines_here = 0
                    for (const li of clue.indices) {
                        if (assignment[li] === 1) mines_here++
                    }
                    if (mines_here !== clue.need) return
                }

                total_valid++
                for (let i = 0; i < n; i++) {
                    if (assignment[i] === 1) mine_counts[i]++
                }
                return
            }

            assignment[idx] = 1
            if (can_still_satisfy(comp_clue_data, assignment, idx + 1)) {
                enumerate(idx + 1)
                if (aborted) return
            }

            assignment[idx] = 0
            if (can_still_satisfy(comp_clue_data, assignment, idx + 1)) {
                enumerate(idx + 1)
                if (aborted) return
            }
        }

        branches = branch_budget
        aborted = false
        enumerate(0)
        if (aborted) continue

        if (total_valid === 0) continue

        for (let i = 0; i < n; i++) {
            const [c, r] = comp.unknowns[i]
            if (state[c][r] !== "blank") continue

            if (mine_counts[i] === 0) {
                simulate_open(grid_value, state, c, r)
                progress = true
            } else if (mine_counts[i] === total_valid) {
                state[c][r] = "flag"
                progress = true
            }
        }
    }

    return progress
}

function solve_board(grid_value, grid_state, total_mines, difficulty) {
    const state = grid_state.map(col => col.slice())

    while (true) {
        if (layer_0(grid_value, state, total_mines)) continue
        if (layer_1(grid_value, state)) continue
        if (difficulty >= 1 && layer_2(grid_value, state)) continue
        if (difficulty >= 2 && layer_3(grid_value, state, total_mines)) continue
        if (difficulty >= 3 && layer_4(grid_value, state)) continue
        break
    }

    //check if the board is clear
    for (let i = 0; i < game.width; i++) {
        for (let j = 0; j < game.height; j++) {
            if (grid_value[i][j] !== 9 && state[i][j] !== "clear") {
                return false
            }
        }
    }
    return true
}

function number_tiles() {
    for (let i = 0; i < game.width; i++) {
        for (let j = 0; j < game.height; j++) {
            if (game.grid_value[i][j] !== 9) {
                let mines = 0
                for_each_neighbor(i, j, (nc, nr) => {
                    if (game.grid_value[nc][nr] === 9) mines++
                })
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

function construct_guessless(click_c, click_r, difficulty) {
    const width = game.width
    const height = game.height
    const target_mines = game.mines

    const min_attempts = 3
    const time_budget_ms = 2000
    const default_batch_size = 3

    //tiles that must stay mine-free
    const safe_zone = new Set()
    safe_zone.add(click_c + "," + click_r)
    for_each_neighbor(click_c, click_r, (nc, nr) => {
        safe_zone.add(nc + "," + nr)
    })

    //available tiles for mine placement
    const all_candidates = []
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            if (!safe_zone.has(i + "," + j)) {
                all_candidates.push([i, j])
            }
        }
    }

    const max_possible = all_candidates.length
    const capped_target = Math.min(target_mines, max_possible)

    let best_board = null
    let best_mine_count = -1
    let attempts = 0
    let fails = 0
    const start_time = performance.now()

    const trial_state = new Array(width)
    for (let i = 0; i < width; i++) {
        trial_state[i] = new Array(height).fill("blank")
    }

    function place_mine(trial_value, c, r) {
        trial_value[c][r] = 9
        for_each_neighbor(c, r, (nc, nr) => {
            if (trial_value[nc][nr] !== 9) {
                trial_value[nc][nr]++
            }
        })
    }

    function unplace_mine(trial_value, c, r) {
        trial_value[c][r] = count_neighbor_mines(trial_value, c, r)
        for_each_neighbor(c, r, (nc, nr) => {
            if (trial_value[nc][nr] !== 9) {
                trial_value[nc][nr]--
            }
        })
    }

    function check_solvable(trial_value, mine_count) {
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                trial_state[i][j] = "blank"
            }
        }
        simulate_open(trial_value, trial_state, click_c, click_r)
        return solve_board(trial_value, trial_state, mine_count, difficulty)
    }

    while (true) {
        fails = 0
        attempts++

        //empty board, fresh candidate pool
        const trial_value = new Array(width)
        for (let i = 0; i < width; i++) {
            trial_value[i] = new Array(height).fill(0)
        }

        const candidates = all_candidates.slice()
        shuffle(candidates)

        let placed = 0

        while (placed < capped_target && candidates.length > 0) {
            const batch_size = Math.min(
                default_batch_size,
                capped_target - placed,
                candidates.length,
            )

            const batch = []
            for (let i = 0; i < batch_size; i++) {
                const [c, r] = candidates.pop()
                place_mine(trial_value, c, r)
                batch.push([c, r])
            }

            //check solvability for the whole batch
            if (check_solvable(trial_value, placed + batch_size)) {
                placed += batch_size
            } else {
                //batch failed, revert all mines in the batch
                fails++
                for (let i = batch.length - 1; i >= 0; i--) {
                    const [c, r] = batch[i]
                    unplace_mine(trial_value, c, r)
                }

                //fallback to individual placement
                for (const [c, r] of batch) {
                    place_mine(trial_value, c, r)
                    if (check_solvable(trial_value, placed + 1)) {
                        placed++
                    } else {
                        unplace_mine(trial_value, c, r)
                    }
                }
            }
        }

        //update best
        if (placed > best_mine_count) {
            best_mine_count = placed
            best_board = trial_value.map(col => col.slice())
        }

        //target reached
        if (placed === capped_target) {
            return {
                grid_value: best_board,
                mines: best_mine_count,
                attempts: attempts,
                fails: fails,
                time: performance.now() - start_time,
            }
        }

        const elapsed = performance.now() - start_time
        if (attempts >= min_attempts && elapsed >= time_budget_ms) break
    }

    if (best_board === null) return null

    return {
        grid_value: best_board,
        mines: best_mine_count,
        attempts: attempts,
        fails: fails,
        time: performance.now() - start_time,
    }
}

function open_tile(c, r) {
    if (game.generating) return
    if (c < 0 || r < 0 || c >= game.width || r >= game.height) return
    if (game.grid_state[c][r] !== "blank" || game.end) return

    if (game.first_click === false) {
        game.first_click = true

        document.body.classList.add("generating")
        game.generating = true

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const result = construct_guessless(c, r, game.difficulty)

                if (result !== null) {
                    game.grid_value = result.grid_value
                    game.mines = result.mines

                    console.log(
                        "Board generation took " +
                            Math.round(result.time) +
                            "ms (" +
                            result.attempts +
                            " attempt" +
                            (result.attempts === 1 ? "" : "s") +
                            "), " +
                            result.fails +
                            " batches failed",
                    )
                } else {
                    console.warn(
                        "Board generation failed, using random instead",
                    )

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
                    for_each_neighbor(c, r, move_mine)

                    number_tiles()
                }

                document.body.classList.remove("generating")
                game.generating = false

                reveal_tile(c, r)
            })
        })
        return
    }

    reveal_tile(c, r)
}

function reveal_tile(c, r) {
    if (c < 0 || r < 0 || c >= game.width || r >= game.height) return
    if (game.grid_state[c][r] !== "blank" || game.end) return

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
                            "cell_" + i + "_" + j,
                        ).className = "grid_cell finish even"
                    else if ((i + j) % 2 === 1)
                        document.getElementById(
                            "cell_" + i + "_" + j,
                        ).className = "grid_cell finish odd"
                }
            }
        }
        game.end = true
        let highlight = document.querySelectorAll(".grid_cell.number.even")
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
        document.getElementById("num_" + c + "_" + r).className = "grid_emoji"
        document.getElementById("num_" + c + "_" + r).innerText = "💥"
        let highlight = document.querySelectorAll(".grid_cell.number.even")
        highlight.forEach(element => {
            element.className = "grid_cell even"
        })
        highlight = document.querySelectorAll(".grid_cell.number.odd")
        highlight.forEach(element => {
            element.className = "grid_cell odd"
        })
        for (let i = 0; i < game.width; i++) {
            for (let j = 0; j < game.height; j++) {
                if (game.grid_state[i][j] !== "clear") open_tile_death(i, j)
            }
        }
    } else if (game.grid_value[c][r] > 0) {
        document.getElementById("num_" + c + "_" + r).className = "grid_number"
        document.getElementById("num_" + c + "_" + r).style.color =
            number_color[game.grid_value[c][r]]
        document.getElementById("num_" + c + "_" + r).innerText =
            game.grid_value[c][r]
    } else if (game.grid_value[c][r] === 0) {
        document.getElementById("num_" + c + "_" + r).className = "grid_empty"
        document.getElementById("num_" + c + "_" + r).innerText = ""

        window.setTimeout(function () {
            for_each_neighbor(c, r, open_tile)
        }, 0)
    }
}

function open_tile_death(c, r) {
    if (game.generating) return
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
    if (game.generating) return
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
        for_each_neighbor(c, r, (nc, nr) => {
            if (game.grid_state[nc][nr] === "flag") flags++
        })

        if (game.grid_value[c][r] === flags) {
            window.setTimeout(function () {
                for_each_neighbor(c, r, open_tile)
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
        Number(document.getElementById("mines").value),
    )
    game.difficulty = Number(document.getElementById("difficulty").value)
    document.documentElement.style.setProperty(
        "--hue",
        Number(document.getElementById("hue").value),
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
    document.getElementById("mines").max = Math.min(
        size - 9,
        Math.floor(size * 0.3),
    )
    let density = (19 + size ** 0.5) / 200
    if (density > 0.25) density = 0.25
    document.getElementById("max_mines").innerHTML =
        "(max: " +
        Math.min(size - 9, Math.floor(size * 0.3)) +
        ") (suggested: " +
        Math.floor(size * density) +
        ")"
    document.getElementById("mine_density").innerHTML =
        "Density: " +
        ((Number(document.getElementById("mines").value) * 100) / size).toFixed(
            1,
        ) +
        "%"
    document.getElementById("hue").style.color =
        "hsl(" + Number(document.getElementById("hue").value) + ",90%,50%)"
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
