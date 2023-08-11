import sys
print("Starting python")
# Ensure that at least two arguments are provided
if len(sys.argv) < 3:
    print("Please provide two numbers as arguments.")
else:
    try:
        num1 = int(sys.argv[1])
        num2 = int(sys.argv[2])
        total = num1 + num2
        print("Sum:", total)
    except ValueError:
        print("Invalid input. Please provide valid numbers.")
