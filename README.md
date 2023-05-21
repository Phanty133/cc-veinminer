# cc-veinminer

A strip/vein mining program for ComputerCraft/CC: Tweaked mining turtles.

## Features:
- Strip mining - Mines 3 blocks forwards, then `N` blocks to the left and right.
- If an ore or any other block that matches `orePredicate(name)` is detected when mining, the turtle will mine that block and all connected blocks that match the predicate. In short, the turtle automatically mines out ore veins.
- Automatic torch placement at shaft junctions.
- Automatic refueling from inventory based on a fuel whitelist.
- Automatic inventory clearing using an ender chest that is kept in the turtle's inventory. A configurable blacklist with an item overflow setting prevents fuel and torches from being cleared.
- Automatic inventory sorting to prevent the same item type unnecessarily taking up multiple slots.

## ToDo:
- [ ] Output program errors to text chat with Peripherals++
- [ ] Ore vein distance failsafe to prevent the turtle from wandering off too far for any reason
- [ ] Correctly handle unmineable blocks that match the ore predicate
- [ ] Implement a more user-friendly way to configure whitelists/blacklists, shaft length and refuel target.