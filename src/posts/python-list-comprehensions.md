---
title: List Comprehensions
tags: python
---

# What is a list comprehension
A list comprehension creates a list of items by iterating through an expression. It's similar to a loop in that it allows you to generate new lists by applying an operation to each item in an existing iterable, but it does so in a more concise and readable way.

# Example

## Basic list comprehension
```python
# Create a list of squares from 0 to 9
squares = [x**2 for x in range(10)]
print(squares)

[0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
```

## List comprehension with a condition
List comprehensions can also be written with conditions. If there's a condition, the operation will only apply when the item in the list meets the condition.

```python
# Create a list of even numbers from 0 to 9
evens = [x for x in range(10) if x % 2 == 0]
print(evens)

[0, 2, 4, 6, 8]
```
## Including multiple loops
Multiple `for` loops can be included inside a list comprehension. These can be used to create tuples (pairs) of values in lists. 

```python
# Create a list of tuples (x, y) where x is from 1 to 3 and y is from 'a' to 'c'
pairs = [(x, y) for x in range(1, 4) for y in ['a', 'b', 'c']]
print(pairs)

[(1, 'a'), (1, 'b'), (1, 'c'), (2, 'a'), (2, 'b'), (2, 'c'), (3, 'a'), (3, 'b'), (3, 'c')]
```
