---
title: Map Functions
tags: python
---

# What is a map() function?
It's a built in Python function that performs a function on each item in an iterable (e.g. string, list, tuple - it'll work on any iterable) and returns a map object (an iterator).

### Basic Syntax
```python
map(function, iterable, [iterable2, iterable3, iterable4])
```

### Example
```python
>>> def double(x):
...     return x * 2
...     
>>> numbers = [1, 2, 3, 4, 5]
>>> doubled_numbers = map(double, numbers)
>>> print(list(doubled_numbers))
[2, 4, 6, 8, 10]
>>> 
```

## Isn't this pretty similar to a list comprehension?
Yes, sort of. They both transform iterables like lists but they differ in how they're written and how they perform, 

List comprehensions are concise, the logic is applied in one line (i.e. the function is defined in the comprehension); map() applies a function (defined upstream or with lambda) and returns a map object, then wrapping it in list() materialises the results. 

::: tip
`map() `can be slightly faster, but comprehensions can be preferred for readability. 
:::