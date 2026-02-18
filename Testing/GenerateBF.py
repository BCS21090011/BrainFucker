def GenerateDumbPrintBFCode(text: str) -> str:
    """
    Generate Brainfuck code to print text using only increment
    Please note that each character will take a cell
    And each cell will need to increment until the character's ASCII value
    But the memory will have all the characters stored after the execution
    The memPtr will be pointing at the cell after the last character
    """

    bfCode: str = ""

    for char in text:
        charInt: int = ord(char)
        bfCode += "+" * charInt     # Increment cell to print
        bfCode += ".>"              # Print and move to next cell

    return bfCode

def GenerateOneCellPrintBFCode(text: str, clearOutCell: bool=False) -> str:
    """
    Generate Brainfuck code to print text using only one cell
    Everything takes place in one cell only
    The cell will be 0 if clearOutCell is True, else it will store the ASCII value of last character
    Will not move the memPtr, the memPtr will be pointing at the same cell as before
    """

    cellPrevCharInt: int = 0
    bfCode: str = ""

    for char in text:
        charInt: int = ord(char)
        
        charDiffWithPrev: int = charInt - cellPrevCharInt

        if charDiffWithPrev > 0:
            bfCode += "+" * charDiffWithPrev        # Increment until reach current char ASCII value
        else:
            bfCode += "-" * abs(charDiffWithPrev)   # Decrement until reach current char ASCII value

        cellPrevCharInt = charInt
        bfCode += "."                               # Print the character

    if clearOutCell:
        bfCode += "-" * cellPrevCharInt             # Clear out the cell

    return bfCode

def GenerateTakeInputBFCode(charCount: int, printAfter: bool=True, textBeforePrint: str="") -> str:
    """
    Generate Brainfuck code to take charCount characters of input
    The input characters will be stored in the memory across the cells
    Can store memSize - 1 characters of input
    The cell after the last input character will be 0
    If textBeforePrint is provided, it will be printed before printing the input
    textBeforePrint will use the cell after the last input character to print, will clear that cell to 0 after printing
    """
    
    bfCode: str = ""

    bfCode += ">".join(["+"] * charCount)   # Fill charCount cells with 1
    bfCode += "<" * (charCount - 1)         # Move to the first cell
    bfCode += "[,>]"                        # Take input and move to next cell until the next cell is 0

    if printAfter:
        if textBeforePrint is not None and textBeforePrint != "":
            bfCode += GenerateOneCellPrintBFCode(textBeforePrint, True) # Print the text before printing the input

        bfCode += "<" * charCount   # Move to the first cell
        bfCode += "[.>]"            # Print the cell value and move to next cell until next cell is 0

    return bfCode

def GenerateTakeInputUntilCharBFCode(escapeChar: str, printAfter: bool=True, textBeforePrint: str="") -> str:
    """
    Generate the brainfuck code to take input until the escape character is encountered
    The input characters will be stored in the memory across the cells
    The memory:
        {startOfChars, only exists if printAfter is true}{inputCharacter1}{inputCharacter2}{...}{lastInputCharacter}{ifFlag}{whileFlag}
    If printAfter is False, can store memSize - 2 characters of input
    If printAfter is True, can store memSize - 3 characters of input
    The escape character will not be stored
    If textBeforePrint is provided, it will be printed before printing the input
    textBeforePrint will use the whileFlag cell to print, will clear that cell to 0 after printing
    The memPtr will be pointing at the whileFlag cell if printAfter is False
    The memPtr will be pointing at the ifFlag cell if printAfter is True
    """

    escapeCharInt: int = ord(escapeChar)
    bfCode: str = ""

    if printAfter:
        bfCode += ">"   # Leaving a blank cell as the start of the input characters

    # Brainfuck code to take input: f">+[-<,{'-' * escapeCharInt}[{'+' * escapeCharInt}>>+<]>]"

    # The setup before the start of the loop can be seen as:
    # bool whileFlag = true;    // Note that in the first iteration,
    #                           // the ifFlag cell will be used as the whileFlag
    # 
    # while (whileFlag) {
    #   whileFlag = false;
    #
    #   char inputChar = takeInput();
    # 
    #   if (inputChar != escapeChar) {
    #       whileFlag = true;
    #   }
    # }
    # 
    # In the last iteration, the escape character will be worked at the ifFlag cell,
    # The ifFlag cell value will still be 0 since the escape val will not be stored (will be 0) anyway

    bfCode += ">"                   # To compensate the < later, move to the ifFlag cell and set it to 1 to enter the while loop
    bfCode += "+"                   # Set the ifFlag cell to 1 to enter the while loop

    bfCode += "["                   # Start of the while (cellVal != escapeChar) loop
    bfCode += "-"                   # If this is the first iteration, clear the value that was used to enter the while loop to 0
                                    # If this is not the first iteration, clear the whileFlag to 0

    bfCode += "<"                   # Move to the left cell, this cell will be used to store the input
                                    # This cell movement is necessary to compensate the > outside the if loop later
                                    # If didn't do so, there will be a blank cell between every character

    bfCode += ","                   # Take input and store in the cell

    # Below can be seen as an if (cellVal != escapeChar) loop
    bfCode += "-" * escapeCharInt   # Decrement by escapeCharInt, the cellVal will be 0 if it was the escapeChar
    bfCode += "["                   # If the cellVal was not escapeChar (cellVal != 0), enter the loop

    # Start of if (cellVal != escapeChar) loop

    bfCode += "+" * escapeCharInt   # Set the cellVal back to the original value
    bfCode += ">"                   # Move to the right cell, this cell (ifFlag cell) will remain 0 to escape the if loop
    bfCode += ">"                   # Move to the right cell again, this cell (whileFlag cell) will be set as the flag to escape the while loop
    bfCode += "+"                   # Set the flag as 1 to indicate that the cellVal is not the escapeChar, so don't escape the while loop
    bfCode += "<"                   # Move to the left cell to points to the ifFlag cell
    bfCode += "]"                   # Escape the if loop

    # End of if (cellVal != escapeChar) loop

    bfCode += ">"                   # Check the whileFlag to see if the cellVal was the escapeChar
    bfCode += "]"                   # If cellVal was the escapeChar, escape the while loop

    # After collecting all the input characters,
    # the memPtr will be pointing at the whileFlag cell,
    # which is the second cell after the last cell containing the input characters

    if printAfter:
        if textBeforePrint is not None and textBeforePrint != "":
            bfCode += GenerateOneCellPrintBFCode(textBeforePrint, True) # Print the text before printing the input

        # Brainfuck code to print the input: "<<[<]>[.>]"
        bfCode += "<<"      # Move through the two empty cells
        bfCode += "[<]"     # Loop through the input characters until the start of the input character,
                            # the previously left empty cell, is encountered
        bfCode += ">"       # Move to the first input character
        bfCode += "[.>]"    # Loop through and print the input characters until the end of the characters is encountered

    return bfCode

# --------------------------------Playzone--------------------------------

def _inputWithPlaceholder(escapeChar: str, placeHolder: str="input here...", printAfter: bool=True, textBeforePrint: str="") -> str:
    bfCode: str = ""
    placeHolderLen: int = len(placeHolder)

    bfCode += GenerateOneCellPrintBFCode(placeHolder + ("\b" * placeHolderLen), True)
    bfCode += GenerateTakeInputUntilCharBFCode(escapeChar, printAfter, textBeforePrint)

    return bfCode

# ------------------------------------------------------------------------

if __name__ == "__main__":
    import sys

    def _handleTakeInput(*args):
        if len(args) < 1:
            print("Error: charCount is required")
            return
        
        try:
            charCount: int = int(args[0])
        except ValueError:
            print("Error: charCount must be an integer")
            return
        
        print(GenerateTakeInputBFCode(charCount, len(args) > 1, " ".join(args[1:])))

    def _handleTakeInputAndPrint(*args):
        if len(args) < 1:
            print("Error: charCount is required")
            return
        
        try:
            charCount: int = int(args[0])
        except ValueError:
            print("Error: charCount must be an integer")
            return
        
        print(GenerateTakeInputBFCode(charCount, True, " ".join(args[1:])))

    def _handleTakeUntilChar(*args):
        if len(args) < 1:
            print("Error: escapeChar is required")
            return
        
        escapeChar: str = args[0]
        
        print(GenerateTakeInputUntilCharBFCode(escapeChar, len(args) > 1, " ".join(args[1:])))

    def _handleTakeUntilCharAndPrint(*args):
        if len(args) < 1:
            print("Error: escapeChar is required")
            return
        
        escapeChar: str = args[0]
        
        print(GenerateTakeInputUntilCharBFCode(escapeChar, True, " ".join(args[1:])))

    modes: dict[str, dict] = {
        "dumb-print": {
            "description": "Generate code to print text using only increment and a lot of cells. charCount will be part of texts",
            "func": lambda *args: print(GenerateDumbPrintBFCode(" ".join(args)))
        },
        "one-cell-print": {
            "description": "Generate code to print text using only one cell. charCount will be part of texts",
            "func": lambda *args: print(GenerateOneCellPrintBFCode(" ".join(args)))
        },
        "take-x-input": {
            "description": "Generate code to take charCount characters of input, will print if texts are provided",
            "func": _handleTakeInput
        },
        "take-x-input-and-print": {
            "description": "Generate code to take charCount characters of input and print it",
            "func": _handleTakeInputAndPrint
        },
        "take-until-char": {
            "description": "Generate code to take input until the escape character is encountered, will print if texts are provided",
            "func": _handleTakeUntilChar
        },
        "take-until-char-and-print": {
            "description": "Generate code to take input until the escape character is encountered and print it",
            "func": _handleTakeUntilCharAndPrint
        }
    }

    def _getMode(mode: str) -> str:
        modeNames: list[str] = list(modes.keys())

        if mode in modeNames:
            return mode
        
        try:
            modeInt: int = int(mode)

            if modeInt in range(len(modeNames)):
                return modeNames[modeInt]
        except ValueError:
            pass

        return None

    def _printHelp():
        print("Usage: python GenerateBF.py <mode?> <charCount / escapeChar?> <...texts>")
        print("Modes:")

        for mode, modeData in modes.items():
            description: str = modeData.get("description", "")
            print(f"    {mode}: {description}")

    if len(sys.argv) <= 1:
        _printHelp()
    else:
        mode: str = sys.argv[1].lower()

        mode = _getMode(mode)

        if mode is None:
            print("Invalid mode")
            _printHelp()
        else:
            args: list[str] = sys.argv[2:]
            modes[mode]["func"](*args)
    
    # print(_inputWithPlaceholder(";", "Input: ", True, "\n\rInput: "))
