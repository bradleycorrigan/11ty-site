---
title: Caesar Cipher
tags: python
---

# What is a Caesar Cipher?
A Caesar Cipher is a way of encoding messages by shifting all the letters across by a set number. E.g. with a shift of 3,`hello world` becomes `khoor zruog`. 
It's named as such because apparently Caesar used it. Anyway, I've been focussing on my dbt/sql a lot recently and haven't had much chance to practice Python and 
this constantly leads to me atrophying basically everything I learn, so this quite common Python challenge ended up being a lot harder for me than it should've. I think there's definitely something there about finding ways to incorporate Python more into my daily work life but that feels like a separate post. 

### The challenge
The challenge is to take a message, decode it, and encode a response. 
```python
# We need to define a string of the entire alphabet first 
alphabet = 'abcdefghijklmnopqrstuvqxyz'

# Now, let's make a function to handle encoding the message
# It needs to take two inputs, the message we'd like to encode, and how much we'd like to offset it by 
def encode_message(message, offset):
    result = '' # an empty string to store the result
    for char in message: # start a for loop to loop through the message
        if char in alphabet: 
            new_index = alphabet.index(char) + offset) % 26
            # if the character is in the alphabet, find it's place (using the alphabet var), and shift it along, use the modulo to make sure we don't spill over*
            result += alphabet[new_index] # add the new letter to the result
        else:
            result += char # if the char isn't in the alphabet, it stays as before (e.g. `!`)
    return result 

print(caesar_cipher("hello world!", 3) # Output: "khoor zruog"

# Now, decoding messages. We don't need to recode the logic, we can reuse the function
def caesar_decipher(message -offset):
    return caesar_cipher(message, -shift)

print(caesar_decipher("khoor zruog", 3))  # Output: "hello world"

```

## What if we don't know the offset?
---