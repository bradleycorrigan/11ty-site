---
title: pyplot
tags: python
---

# Matplotlib Pyplot Cheat Sheet
## 1. Basic Plotting
To plot data points with specific styles (e.g., red circles) and define the viewing window:

```python
# First list = x values [1, 2, 3, 4]
# Second list = y values [1, 4, 9, 16]
# 'ro' = red (r) circles (o)
plt.plot([1, 2, 3, 4], [1, 4, 9, 16], 'ro')

# Set the viewing window boundaries
# Format: (x-min, x-max, y-min, y-max)
# This example shows x from 0 to 6 and y from 0 to 20
plt.axis((0, 6, 0, 20))

# Show the plot on screen
plt.show()
```
## 2. Titles and Axis Labels
Add text to describe what your plot shows:

```python
# Add a title at the top of the plot
plt.title('this is a title')

# Label what the x-axis represents
plt.xlabel('date')

# Label what the y-axis represents
plt.ylabel('inbound volume')
```

## 3. Legends
Legends help identify which line is which when you have multiple lines on one plot.

```python
# The 'label' parameter gives each line a name for the legend
plt.plot(x, y, color='red', label='Line Y')
plt.plot(x, z, color='green', label='Line Z')

# Display the legend box (shows the labels you defined above)
plt.legend()

# Move the legend to a specific position
# (0, 0) = bottom-left corner, (1, 1) = top-right corner
plt.legend(bbox_to_anchor = (x, y))
```
## 4. Tick Parameter Modification
Customize how the numbers and tick marks look on your axes.

```python
# axis='x' means only change the x-axis (use 'y' or 'both' for others)
# direction='out' makes tick marks point outward
# color='red' changes the tick mark color to red
# labelsize='large' makes the numbers bigger
# labelcolor='purple' changes the number color to purple
# labelrotation=30 tilts the numbers 30 degrees
plt.tick_params(axis='x', direction='out', color='red', 
                labelsize='large', labelcolor='purple', labelrotation=30)
```

## 5. Saving Figures
Save your plot as an image file instead of just showing it on screen.

```python
# Save with default settings (usually 100 dpi)
plt.savefig('name.png')

# Save with better quality and make sure nothing gets cut off
# dpi=128 makes the image higher resolution (higher = better quality)
# bbox_inches='tight' prevents labels/legends from being cropped
plt.savefig('my_lineplot.png', dpi=128, bbox_inches='tight')
```