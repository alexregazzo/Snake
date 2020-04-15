let COLS;
let ROWS;

let get_rows = window.location.href.match(/rows=(\d+)/i);
let get_cols = window.location.href.match(/cols=(\d+)/i);
ROWS = (get_rows === null) ? 10 : Number.parseInt(get_rows[1]);
COLS = (get_cols === null) ? 10 : Number.parseInt(get_cols[1]);

let get_food = window.location.href.match(/food=(\d+)/i);
let FOOD_AMOUNT = (get_food === null) ? 1 : Number.parseInt(get_food[1]);

let LEFT;
let RIGHT;
let UP;
let DOWN;

let player;
let foods = [];
let dead_snake_parts = [];

//paddings: at least
const left_padding = 200;
const right_padding = 10;
const top_padding = 10;
const bottom_padding = 10;
let translate_x = 0;
let translate_y = 0;

let font_size = 20;

let w;
let h;
let version;

function preload() {
	fetch("https://api.github.com/repos/alexregazzo/Snake/commits").then(function (response) {
		if (response.status === 200) {
			return response.json();
		} else throw new Error("Not 200 response")
	}).then(function (data) {
		version = data.length;
	}).catch(function (error) {
		version = "error"
	});
}

function setup() {

	LEFT = LEFT_ARROW;
	RIGHT = RIGHT_ARROW;
	UP = UP_ARROW;
	DOWN = DOWN_ARROW;
	createCanvas(windowWidth, windowHeight);


	let usable_width = width - left_padding - right_padding;
	let usable_height = height - top_padding - bottom_padding;

	// check if passed argument to fill with passed size
	let get_fitsize = window.location.href.match(/fitsize=(\d+)/i);
	if (get_fitsize !== null) {
		let block_size = Number.parseInt(get_fitsize[1]);
		let ncols = Math.floor(usable_width / block_size);
		let nrows = Math.floor(usable_height / block_size);

		// window.location.href = window.location.origin + `?rows=${nrows}&cols=${ncols}`;
		COLS = ncols;
		ROWS = nrows;
	}

	if (usable_width / COLS > usable_height / ROWS) {
		// bigger width / cols
		w = usable_height / ROWS;
	} else {
		//bigger height / rows
		w = usable_width / COLS;
	}
	translate_x = width - usable_width - right_padding;
	translate_y = height - usable_height - bottom_padding;
	h = w;
	let get_fit = window.location.href.match(/[?&]fit(?:=[a-z0-9]*)?(?:$|&)/i);
	if (get_fitsize === null && get_fit !== null) {
		// fill with default size
		COLS = Math.floor(usable_width / w);
		ROWS = Math.floor(usable_height / h);
	}
	textSize(font_size);
	restart();
}

function restart() {
	foods = [];
	dead_snake_parts = [];
	player = new Snake();
	for (let i = 0; i < FOOD_AMOUNT; i++) {
		new_food();
	}
}

function draw() {
	if (player.is_dead()) {
		// GAME OVER
		background(150, 33, 33);
		noStroke();
		fill(255, 50, 50);
		text(`Game over`, 0, font_size * 4);
		fill(255, 255, 0);
		text(`Press space to restart`, 0, font_size * 5);
		// noLoop();
	} else {
		// GAME RUNNING
		background(33);
		if (player.direction === null) {
			// GAME JUST STARTED
			noStroke();
			fill(255);
			text(`Press arrow to start`, 0, font_size * 4);
		}

		// player move
		player.move();

		// Check food eat
		for (let i = foods.length - 1; i >= 0; i--) {
			if (player.is_colliding(foods[i])) {
				foods.splice(i, 1);
				player.grow();
				new_food();
			}
		}
		// Check dead snake part hit
		for (let i = dead_snake_parts.length - 1; i >= 0; i--) {
			if (player.is_colliding(dead_snake_parts[i])) {
				dead_snake_parts.splice(i, 1);
				player.take_hit();
			}
		}
	}
	noStroke();
	fill(255);
	text(`Version: ${version}`, 0, font_size * 1);
	text(`Score: ${round(player.score)}`, 0, font_size * 2);
	text(`Score lost: ${round(player.score_lost)}`, 0, font_size * 3);

	translate(translate_x, translate_y);

	// draw scenario
	stroke(144);
	fill(0);
	for (let i = 0; i < ROWS; i++) {
		for (let j = 0; j < COLS; j++) {
			rect(j * w, i * h, w, h);
		}
	}

	//draw player
	player.draw();

	// draw food
	fill(255, 0, 0);
	for (let {
			x,
			y
		} of foods) {
		rect(x * w, y * h, w, h);
	}

	//draw dead snake parts
	fill(139, 69, 19);
	for (const {
			x,
			y
		} of dead_snake_parts) {
		rect(x * w, y * h, w, h);
	}

}

function new_food() {
	let foodpos = get_random_pos();
	while (player.is_colliding(foodpos)) {
		foodpos = get_random_pos();
	}
	for (let {
			x,
			y
		} of dead_snake_parts) {
		if (x === foodpos.x && y === foodpos.y) {
			new_food();
			return
		}
	}
	foods.push(foodpos);
}

function get_random_pos() {
	return {
		x: floor(random(0, COLS)),
		y: floor(random(0, ROWS))
	}
}

class Snake {
	constructor(body = null) {
		if (body === null) {
			this.body = [get_random_pos()];
		} else if (Array.isArray(body)) {
			this.body = [...body];
			// console.log(this.body);
		} else {
			this.body = [{
				...body
			}];
		}
		this.score = 0;
		this.score_lost = 0;
		this.direction = null;
		this.last_move = 0;
		this.move_interval = 200; //millis
		this.ok_to_move = true;
	}

	set_direction(DIR) {
		if (this.ok_to_move) {
			this.direction = DIR;
			this.ok_to_move = false;
		}
	}

	check_hit_itself() {
		for (let i = 0; i < this.body.length; i++) {
			for (let j = i + 1; j < this.body.length; j++) {
				if (
					this.body[i].x === this.body[j].x &&
					this.body[i].y === this.body[j].y
				) {
					let deadbody = this.body.splice(j);
					this.score_lost += 2 / 3 * deadbody.length;
					this.score -= 2 / 3 * deadbody.length;
					deadbody.shift();
					dead_snake_parts.push(...deadbody);
				}
			}
		}
	}

	take_hit() {
		this.body.pop();
	}

	draw() {
		noStroke();
		fill(0, 255, 0);
		// let w = size / COLS;
		// let h = size / ROWS;
		for (let {
				x,
				y
			} of this.body) {
			rect(x * w, y * h, w, h);
		}
	}

	grow() {
		this.body.push({
			...this.body[this.body.length - 1]
		});
		this.score++;
		this.move_interval -= 5;
		if (this.move_interval < 50) this.move_interval = 50;
		// noLoop();
	}
	is_dead() {
		return this.body.length === 0;
	}

	is_colliding(pos) {
		for (let {
				x,
				y
			} of this.body) {
			if (pos.x === x && pos.y === y) return true;
		}
		return false;
	}

	move() {
		if (millis() - this.last_move >= this.move_interval) {
			if (this.direction !== null) {
				let head = {
					...this.body[0]
				};
				if (this.direction === UP) {
					head.y -= 1;
					if (head.y < 0) {
						head.y = ROWS - 1;
					}
				} else if (this.direction === DOWN) {
					head.y += 1;
					if (head.y >= ROWS) {
						head.y = 0;
					}
				} else if (this.direction === LEFT) {
					head.x -= 1;
					if (head.x < 0) {
						head.x = COLS - 1;
					}
				} else if (this.direction === RIGHT) {
					head.x += 1;
					if (head.x >= COLS) {
						head.x = 0;
					}
				}
				this.body.unshift(head);
				this.body.pop();
				this.last_move = millis();
				this.ok_to_move = true;
				this.check_hit_itself()
			}
		}
	}
}

function keyPressed() {
	switch (keyCode) {
		case LEFT:
			if (player.direction === RIGHT) break;
			player.set_direction(LEFT);
			break;
		case RIGHT:
			if (player.direction === LEFT) break;
			player.set_direction(RIGHT);
			break;
		case UP:
			if (player.direction === DOWN) break;
			player.set_direction(UP);
			break;
		case DOWN:
			if (player.direction === UP) break;
			player.set_direction(DOWN);
			break;
		case 32: //space
			if (player instanceof Snake && player.is_dead()) {
				restart();
			}
			break;
	}


}