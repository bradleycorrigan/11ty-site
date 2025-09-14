---
title: Window Functions
tags: SQL
--- 

# What are window functions
Window functions make it possible to do calculations across rows in a table, they're written using `OVER()`. Window functions can:
- Calculate running totals
- Assign rank or row numbers to rows 
  - `rank()` and `row_number` are subtly but importantly different, and we'll get into this further later in the article

## Types of window functions
| Window Function | Description |
|-----------------|-------------|
| `SUM()` | Calculates the total of a numeric column across a window of rows, while keeping each row intact. |
| `ROW_NUMBER()` | Assigns a unique sequential number to each row within a partition. Useful for ranking, top-N selection, or deduplication. |
| `RANK()` | Assigns ranks to rows within a partition, with ties receiving the same rank. Useful for handling ties gracefully. |
| `DENSE_RANK()` | Similar to `RANK()` but assigns consecutive ranks without gaps, even when there are ties. Creates compact ranking systems. |
| `LEAD()` / `LAG()` | Accesses the value from the next (`LEAD`) or previous (`LAG`) row in a partition. Useful for comparing rows or calculating differences. |

## Window functions vs other aggregates
Another example of an aggregate would be `GROUP BY`. Below, we calculate the total_wingspan for each species of birds, and still get the correct answers. But a few things are different:

- We only get one row per species, and we had to remove bird_id, otherwise the query would treat each bird_id as its own 'group' and the total_wingspan wouldn't truly sum across all birds of the same species
- The rows are collapsed, each species only shows once. In the window function, we managed to keep each individual row, bird_id, individual wingspan AND still get to have the total wingspan for each species

If we want to only see the total wingspan for each species, and don't care about maintaining the individual rows, we can use `GROUP BY`. If we need to keep each individual row, we'd use a window function. 

There's no straight forward *better* choice, but it's about making the right choice for the situation. 
```sql
SELECT
    species,
    SUM(wingspan_cm) AS total_wingspan

    FROM birds
    GROUP BY species;
```
| species | total\_wingspan |
| ------- | --------------- |
| Sparrow | 60              |
| Eagle   | 220             |

---
## SUM()
The line SUM(wingspan_cm) OVER (PARTITION BY species) AS total_wingspan calculates the total wingspan for each species without collapsing rows. It works “over” partitions we’ve defined by species, meaning the calculation restarts for each species. In other words, every bird’s row is preserved, but the total wingspan for its species is shown alongside.

### Example
```sql
SELECT 
    species, 
    bird_id, 
    wingspan_cm,
    SUM(wingspan_cm) OVER (PARTITION BY species) AS total_wingspan -- this line is the window function
FROM birds;
```
| species | bird\_id | wingspan\_cm | total\_wingspan |
| ------- | -------- | ------------ | --------------- |
| Sparrow | 1        | 30           | 60              |
| Sparrow | 2        | 30           | 60              |
| Eagle   | 3        | 120          | 220             |
| Eagle   | 4        | 100          | 220             |

### Common use cases for SUM()
**Running totals:** Calculate cumulative sums as you go through ordered data
```sql
SELECT 
    species,
    bird_id,
    wingspan_cm,
    SUM(wingspan_cm) OVER (ORDER BY bird_id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
FROM birds;
```
**Percentage of total:** Show each row's contribution to the group total
```sql
SELECT 
    species,
    bird_id,
    wingspan_cm,
    SUM(wingspan_cm) OVER (PARTITION BY species) AS species_total,
    ROUND(wingspan_cm * 100.0 / SUM(wingspan_cm) OVER (PARTITION BY species), 1) AS pct_of_species_total
FROM birds;
```
**Moving averages:** Calculate totals over a sliding window of rows
```sql
SELECT 
    species,
    bird_id,
    wingspan_cm,
    SUM(wingspan_cm) OVER (ORDER BY bird_id ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING) AS three_row_sum
FROM birds;
```
---
## RANK()
The `RANK()` function assigns ranks to rows within a partition, but unlike `ROW_NUMBER()`, it handles ties by giving them the same rank. When there are ties, `RANK()` skips the next rank numbers to maintain the correct total count.

### Example
```sql
SELECT 
    species,
    bird_id,
    wingspan_cm,
    RANK() OVER (PARTITION BY species ORDER BY wingspan_cm DESC) AS rank_num
FROM birds;
```
| species | bird\_id | wingspan\_cm | rank\_num |
| ------- | -------- | ------------ | --------- |
| Eagle   | 3        | 120          | 1         |
| Eagle   | 4        | 100          | 2         |
| Sparrow | 1        | 30           | 1         |
| Sparrow | 2        | 30           | 1         |

Notice how both sparrows have the same wingspan (30cm) and receive the same rank (1). This is the key behavior of RANK() - tied values get identical ranks.

### Rank skipping
```sql
-- Imagine we had more birds with these wingspans: 150, 120, 120, 100, 100, 100, 80
SELECT 
    wingspan_cm,
    RANK() OVER (ORDER BY wingspan_cm DESC) AS rank_num
FROM expanded_birds;
```
| wingspan\_cm | rank\_num |
| ------------ | --------- |
| 150          | 1         |
| 120          | 2         |
| 120          | 2         |
| 100          | 4         |
| 100          | 4         |
| 100          | 4         |
| 80           | 7         |

Notice how after two birds tied for rank 2, the next rank is 4 (not 3), and after three birds tied for rank 4, the next rank is 7 (not 5). This preserves the correct relationship between ranks and the actual number of birds that performed better.

### Common use cases for RANK()
**Competition rankings:** When you want tied values to share the same rank

```sql
SELECT 
    *,
    RANK() OVER (ORDER BY wingspan_cm DESC) AS overall_rank
FROM birds;
```

**Top performers per category:** Find the highest-ranking birds in each species, accounting for ties
```sql
SELECT *
FROM (
    SELECT 
        *,
        RANK() OVER (PARTITION BY species ORDER BY wingspan_cm DESC) AS species_rank
    FROM birds
) ranked
WHERE species_rank = 1;
```
---
## DENSE_RANK()
The `DENSE_RANK()` function is similar to `RANK()` in that it assigns the same rank to tied values, but unlike `RANK()`, it doesn't skip any rank numbers. This means rankings are always consecutive, making it useful when you want a compact ranking system without gaps.
```sql
SELECT 
    species,
    bird_id,
    wingspan_cm,
    DENSE_RANK() OVER (PARTITION BY species ORDER BY wingspan_cm DESC) AS dense_rank_num
FROM birds;
```
| species | bird\_id | wingspan\_cm | dense\_rank\_num |
| ------- | -------- | ------------ | ---------------- |
| Eagle   | 3        | 120          | 1                |
| Eagle   | 4        | 100          | 2                |
| Sparrow | 1        | 30           | 1                |
| Sparrow | 2        | 30           | 1                |

### Understanding Dense Ranking
The key difference from `RANK()` is that `DENSE_RANK()` never skips numbers. Here's an example with more data to illustrate:
```sql
-- Using the same expanded dataset: 150, 120, 120, 100, 100, 100, 80
SELECT 
    wingspan_cm,
    DENSE_RANK() OVER (ORDER BY wingspan_cm DESC) AS dense_rank_num
FROM expanded_birds;
```
| wingspan\_cm | dense\_rank\_num |
| ------------ | ---------------- |
| 150          | 1                |
| 120          | 2                |
| 120          | 2                |
| 100          | 3                |
| 100          | 3                |
| 100          | 3                |
| 80           | 4                |

Notice how after two birds tied for rank 2, the next rank is 3 (not 4 like with `RANK()`), and after three birds tied for rank 3, the next rank is 4 (not 7). This creates a compact, gapless ranking system.

### RANK() vs DENSE_RANK() Comparison
Here's a side-by-side comparison to show the difference:
```sql
SELECT 
    wingspan_cm,
    RANK() OVER (ORDER BY wingspan_cm DESC) AS rank_num,
    DENSE_RANK() OVER (ORDER BY wingspan_cm DESC) AS dense_rank_num
FROM expanded_birds;
```
| wingspan\_cm | rank\_num | dense\_rank\_num |
| ------------ | --------- | ---------------- |
| 150          | 1         | 1                |
| 120          | 2         | 2                |
| 120          | 2         | 2                |
| 100          | 4         | 3                |
| 100          | 4         | 3                |
| 100          | 4         | 3                |
| 80           | 7         | 4                |
### Common use cases for DENSE_RANK()
**Categories:** When you want consecutive levels without gaps
```sql
SELECT 
    *,
    CASE 
        WHEN DENSE_RANK() OVER (ORDER BY wingspan_cm DESC) = 1 THEN 'Large'
        WHEN DENSE_RANK() OVER (ORDER BY wingspan_cm DESC) = 2 THEN 'Medium'
        ELSE 'Small'
    END AS size_category
FROM birds;
```
---
## ROW_NUMBER()
The `ROW_NUMBER()` function assigns a unique sequential number to each row within a partition, starting from 1. Unlike `RANK()`, `ROW_NUMBER()` always assigns unique numbers even when there are ties in the data.

### Example
```sql
SELECT 
    species,
    bird_id,
    wingspan_cm,
    ROW_NUMBER() OVER (PARTITION BY species ORDER BY wingspan_cm DESC) AS row_num
FROM birds;
```
| species | bird\_id | wingspan\_cm | row\_num |
| ------- | -------- | ------------ | -------- |
| Eagle   | 3        | 120          | 1        |
| Eagle   | 4        | 100          | 2        |
| Sparrow | 1        | 30           | 1        |
| Sparrow | 2        | 30           | 2        |

Notice how both sparrows have the same wingspan (30cm), but `ROW_NUMBER()`still assigns them unique sequential numbers (1 and 2). The ordering within tied values depends on the database's internal row ordering, which can be unpredictable unless you specify additional `ORDER BY` criteria.

### Common use cases for ROW_NUMBER()
Deduplication: Remove duplicate rows by keeping only the first occurrence
```sql
SELECT *
FROM (
    SELECT 
        *,
        ROW_NUMBER() OVER (PARTITION BY species, wingspan_cm ORDER BY bird_id) AS rn
    FROM birds
) ranked
WHERE rn = 1;
```
Top-N per group: Get the largest bird from each species
```sql 
SELECT *
FROM (
    SELECT 
        *,
        ROW_NUMBER() OVER (PARTITION BY species ORDER BY wingspan_cm DESC) AS rn
    FROM birds
) ranked
WHERE rn = 1;
```
---
## RANK() vs ROW_NUMBER()
Here's a side-by-side comparison to illustrate the key difference:
```sql
SELECT 
    species,
    bird_id,
    wingspan_cm,
    RANK() OVER (PARTITION BY species ORDER BY wingspan_cm DESC) AS rank_num,
    ROW_NUMBER() OVER (PARTITION BY species ORDER BY wingspan_cm DESC) AS row_num
FROM birds;
```
| species | bird\_id | wingspan\_cm | rank\_num | row\_num |
| ------- | -------- | ------------ | --------- | -------- |
| Eagle   | 3        | 120          | 1         | 1        |
| Eagle   | 4        | 100          | 2         | 2        |
| Sparrow | 1        | 30           | 1         | 1        |
| Sparrow | 2        | 30           | 1         | 2        |

---

## LEAD() and LAG()
The `LEAD()` and `LAG()` functions allow you to access values from other rows within the same result set. `LEAD()` looks forward to the next row(s), while `LAG()` looks backward to the previous row(s). These functions are particularly useful for comparing consecutive rows or calculating differences between periods.

### Example
```sql
SELECT 
    species,
    bird_id,
    wingspan_cm,
    LAG(wingspan_cm) OVER (PARTITION BY species ORDER BY bird_id) AS prev_wingspan,
    LEAD(wingspan_cm) OVER (PARTITION BY species ORDER BY bird_id) AS next_wingspan
FROM birds;
```

| species | bird\_id | wingspan\_cm | prev\_wingspan | next\_wingspan |
| ------- | -------- | ------------ | -------------- | -------------- |
| Eagle   | 3        | 120          | NULL           | 100            |
| Eagle   | 4        | 100          | 120            | NULL           |
| Sparrow | 1        | 30           | NULL           | 30             |
| Sparrow | 2        | 30           | 30             | NULL           |

Notice how the first row in each partition has NULL for prev_wingspan (no previous row), and the last row has NULL for next_wingspan (no next row).

### Using offsets and default values
You can specify how many rows to look ahead or behind, and provide default values for when there's no data:

```sql
SELECT 
    species,
    bird_id,
    wingspan_cm,
    LAG(wingspan_cm, 1, 0) OVER (PARTITION BY species ORDER BY bird_id) AS prev_wingspan,
    LEAD(wingspan_cm, 1, 0) OVER (PARTITION BY species ORDER BY bird_id) AS next_wingspan
FROM birds;
```
| species | bird\_id | wingspan\_cm | prev\_wingspan | next\_wingspan |
| ------- | -------- | ------------ | -------------- | -------------- |
| Eagle   | 3        | 120          | 0              | 100            |
| Eagle   | 4        | 100          | 120            | 0              |
| Sparrow | 1        | 30           | 0              | 30             |
| Sparrow | 2        | 30           | 30             | 0              | 


### Common use cases for LEAD() and LAG()
**Calculate differences between consecutive rows:**
```sql 
SELECT 
    species,
    bird_id,
    wingspan_cm,
    wingspan_cm - LAG(wingspan_cm) OVER (PARTITION BY species ORDER BY bird_id) AS wingspan_change
FROM birds;
```
**Compare current value with next/previous:**
```sql
SELECT 
    *,
    CASE 
        WHEN wingspan_cm > LAG(wingspan_cm) OVER (PARTITION BY species ORDER BY bird_id) 
        THEN 'Increased'
        WHEN wingspan_cm < LAG(wingspan_cm) OVER (PARTITION BY species ORDER BY bird_id) 
        THEN 'Decreased'
        ELSE 'Same or First'
    END AS wingspan_trend
FROM birds;
```
**Find the first and last values in a group:**
```sql
SELECT 
    *,
    FIRST_VALUE(wingspan_cm) OVER (PARTITION BY species ORDER BY bird_id) AS first_wingspan,
    LAST_VALUE(wingspan_cm) OVER (PARTITION BY species ORDER BY bird_id 
                                 ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS last_wingspan
FROM birds;
```

---