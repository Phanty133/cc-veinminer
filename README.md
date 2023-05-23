# cc-veinminer

A strip/vein mining program for ComputerCraft/CC: Tweaked mining turtles. Compile with `npm run build`, then upload code generated in `dist/main.lua` to a mining turtle.

## Features
- Strip mining - Mines 3 blocks forwards, then `N` blocks to the left and right.
- If an ore or any other block that matches `orePredicate(name)` is detected when mining, the turtle will mine that block and all connected blocks that match the predicate. In short, the turtle automatically mines out ore veins.
- Automatic torch placement at shaft junctions.
- Automatic refueling from inventory based on a fuel whitelist.
- Automatic inventory clearing using an ender chest that is kept in the turtle's inventory. A configurable blacklist with an item overflow setting prevents fuel and torches from being cleared.
- Automatic inventory sorting to prevent the same item type unnecessarily taking up multiple slots.
