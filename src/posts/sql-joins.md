--- 
title: SQL Joins
tags: 
    - SQL
---

# What are SQL Joins?
::: info
In SQL, joins are  a way of combining data from multiple tables, based on a common key between the tables. For example, you may have a table about `customers` and a table about `sales`; by using `customer_id` you can join information about `customers` and `sales` together. Depending on what you'd like to achieve, you'd choose the appropriate join type. 
:::
---
## Types of joins 
There are different types of joins, that retain different parts of each table. Here's a rundown, but see each part in depth throughout this post:

### Join (Inner Join)
A `join` is sometimes referred to as an `inner join`. This type of join only returns rows that match the condition (i.e. their must be results on both sides)
:::tip
In the spirit of being explicit as possible in your code, it can be good to write `inner join` every time 
:::

### Left join
A `left join` keeps all rows from the left table, if there's no match on the right side, the values are filled with `nulls`

### Right join
The opposite of a `left join`, retains all rows from the right table, and if there's no matches on the left side, fills with `nulls`.
:::tip
For legibility in long queries or models, it can often be best to just flip your tables around and use left joins throughout
:::

### Full join
Returns all rows from both tables, and fills blanks in with nulls. 

### Cross join
Returns all possible combinations of rows

:::warning 
Cross joins can often risk returning very large cartesian products. It's worth really considering if this type of join matches your use case
:::
---

# Left join example
:::info
A `left join` keeps all rows from the left table, if there's no match on the right side, the values are filled with `nulls`. You might use a `left join` when it's important to keep rows even if they don't have a match. For example, if you wanted a list of **all birds**, even if you haven't spotted them yet
:::
```sql
SELECT 
    b.bird_name,
    b.color,
    s.location
FROM Birds b
LEFT JOIN Sightings s
    ON b.bird_id = s.bird_id
ORDER BY b.bird_id;

```
### Left table - birds
| bird\_id | bird\_name | color |
| -------- | ---------- | ----- |
| 1        | Sparrow    | Brown |
| 2        | Robin      | Red   |
| 3        | Blue Jay   | Blue  |
| 4        | Crow       | Black |

### Right table - sightings 
| sighting\_id | bird\_id | location    |
| ------------ | -------- | ----------- |
| 101          | 1        | Park        |
| 102          | 2        | Garden      |
| 103          | 2        | Forest      |
| 104          | 4        | Parking Lot |


### Left join output
| bird\_name | color | location    |
| ---------- | ----- | ----------- |
| Sparrow    | Brown | Park        |
| Robin      | Red   | Garden      |
| Robin      | Red   | Forest      |
| Blue Jay   | Blue  | NULL        |
| Crow       | Black | Parking Lot |

---
# Full join example 
:::info
A full join returns all rows from both tables, filling in NULL for missing matches on either side. You might use a full join when you want a complete picture of both datasets, even if some items don’t have matches. For example, if we logged sightings of birds - but we're not sure what the bird was. 
:::

```sql
SELECT 
    b.bird_name,
    b.color,
    s.location
FROM Birds b
FULL JOIN Sightings s
    ON b.bird_id = s.bird_id
```

### Left table (as before)
| bird\_id | bird\_name | color |
| -------- | ---------- | ----- |
| 1        | Sparrow    | Brown |
| 2        | Robin      | Red   |
| 3        | Blue Jay   | Blue  |
| 4        | Crow       | Black |

### Right table
New sighting, `null` bird_id
| sighting\_id | bird\_id | location    |
| ------------ | -------- | ----------- |
| 101          | 1        | Park        |
| 102          | 2        | Garden      |
| 103          | 2        | Forest      |
| 104          | 4        | Parking Lot |
| 105          | null        | Zoo         |


### Output
| bird\_name | color | location    |
| ---------- | ----- | ----------- |
| Sparrow    | Brown | Park        |
| Robin      | Red   | Garden      |
| Robin      | Red   | Forest      |
| Blue Jay   | Blue  | NULL        |
| Crow       | Black | Parking Lot |
| NULL       | NULL  | Zoo         |

---
# Cross join example
:::info
A `cross join` returns all possible combinations of rows from both tables. This is useful when you want to pair every row from one table with every row from another, but be careful—this can result in a very large number of rows if your tables are big.

For example, with 4 birds and 4 sightings, you'll get 16 rows; this grows quickly.
:::

```sql
SELECT 
    b.bird_name,
    b.color,
    s.location
FROM Birds b
CROSS JOIN Sightings s
ORDER BY b.bird_name, s.location;
```

### Left table - birds
| bird\_id | bird\_name | color |
| -------- | ---------- | ----- |
| 1        | Sparrow    | Brown |
| 2        | Robin      | Red   |
| 3        | Blue Jay   | Blue  |
| 4        | Crow       | Black |

### Right table - sightings 
| sighting\_id | bird\_id | location    |
| ------------ | -------- | ----------- |
| 101          | 1        | Park        |
| 102          | 2        | Garden      |
| 103          | 2        | Forest      |
| 104          | 4        | Parking Lot |

### Cross join output (partial)
| bird\_name | color | location    |
| ---------- | ----- | ----------- |
| Sparrow    | Brown | Park        |
| Sparrow    | Brown | Garden      |
| Sparrow    | Brown | Forest      |
| Sparrow    | Brown | Parking Lot |
| Robin      | Red   | Park        |
| Robin      | Red   | Garden      |
| Robin      | Red   | Forest      |
| Robin      | Red   | Parking Lot |
| Blue Jay   | Blue  | Park        |
| Blue Jay   | Blue  | Garden      |
| Blue Jay   | Blue  | Forest      |
| Blue Jay   | Blue  | Parking Lot |
| Crow       | Black | Park        |
| Crow       | Black | Garden      |
| Crow       | Black | Forest      |
| Crow       | Black | Parking Lot |

