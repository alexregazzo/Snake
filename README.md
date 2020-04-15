# Snake game

## Features:
* Cross wall
* When you hit yourself instead of dying instantaneously you split yourself off, leaving a dead snake on the field that will make you lose length if you hit it.
* Increase speed every growth.

## Map properties
You can add queries using GET method to change map size

> **Example of querying using GET method:**<br/>
> No query:
> https://alexregazzo.github.io/Snake/<br/>
> One query:
> https://alexregazzo.github.io/Snake/?first=123<br/>
> Two queries:
> https://alexregazzo.github.io/Snake/?first=123&second=4<br/>
> Three queries:
> https://alexregazzo.github.io/Snake/?first=123&second=4&third=true

* To set number of ROWS (default 10) use: `rows=[AMOUNT]`
> **Example with 30 rows:**<br/>
> https://alexregazzo.github.io/Snake/?rows=30

* To set number of COLS (default 10) use: `cols=[AMOUNT]`
> **Example with 30 rows:**<br/>
> https://alexregazzo.github.io/Snake/?cols=30

* To fit entire screen using default block size, just define fit: `fit`
> **Example fitting default block size:**<br/>
> https://alexregazzo.github.io/Snake/?fit

* To fit entire screen using defined block size: `fitsize=[BLOCK_SIZE]`
> **Example fitting defined block size of 50 pixels:**<br/>
> https://alexregazzo.github.io/Snake/?fitsize=50

* Set amount of food (default 1): `food=[FOOD_AMOUNT]`
> **Example of 10 foods:**<br/>
> https://alexregazzo.github.io/Snake/?food=10

__**Warning**__:  Order of query does not matter.<br/>
__**Warning**__:  Multi-definitions of a query are ignored, first definition is used.<br/>
__**Warning**__:  `fitsize` overrides `cols` and `rows`, no change if used with `fit`.<br/>
__**Warning**__:  `fit` uses the block size calculated using `cols` and `rows` and fills the screen. If `cols` and `rows` were not defined, default amount is used.<br/>

## Score calculation
* Growth of 1: 1 point
* Lost score: 2/3 * length of snake lost
* Score: growths - lost_score