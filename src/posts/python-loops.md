---
title: Loops
tags:
    - python
---

# What is a loop 
::: info
A loop is a section of code that repeats instructions over and over, usually until a condition is met. For example, until a variable is larger than `X`
:::

## Example
```python
# This loop will run nine times 
number = 10

while number < 10:
    print(number)
    number = number + 1
```
---

# Types of loops

## For Loops
`for` loops take a list and perform an action once for each item inside the list. For example, if you had a list if of birds with five birds in, the action would happen five times. 

For example, this would be the output 
```python
birds = ['blue tit', 'great tit', 'sparrow', 'barn owl', 'kingfisher']

for bird in birds:
    print(bird)

blue tit
great tit
sparrow
barn owl
kingfisher
```
::: tip
The general pattern for a `for` loop looks like this: 

```python
for <variable> in [<list>]:
    <action>
```
:::

::: tip
The name of the variable is arbitrary and you decide it when you write the loop. Of course though, it's better for readability if the variable name makes sense. Nevertheless, with the above example, I could name the variable `dogs` and still get a list of birds. 

```python 
birds = ['blue tit', 'great tit', 'sparrow', 'barn owl', 'kingfisher']

for dog in birds:
    print(dog)

blue tit
great tit
sparrow
barn owl
kingfisher
```
:::

## While Loops
`While` loops repeat an action over and over until a condition is no longer true. I.e. they loop `while` something is true. The example at the very beginning of this post is a `while` loop, and would print the below:
```python
number = 0

while number < 10:
    print(number)
    number += 1
0
1
2
3
4
5
6
7
8
9
```

## Nested Loops
Loops can be nested together, and can be used to access list items that re inside other lists. The item inside the outer loop can be used as the list for the inner loop. 
```python 
birds = [['sparrow', 'red kite'], ['great tit', 'blue tit'], ['cormorant', 'heron']]

# Outer loop iterates over every pair of birds
for pair in birds:
    # The inner loop iterates through each bird in each pair 
    for bird in pair:
        print(bird)

sparrow
red kite
great tit
blue tit
cormorant
heron
```