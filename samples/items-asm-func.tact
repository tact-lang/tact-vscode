asm fun keccak256(s: Slice): Int {
    1
    INT
    HASHEXT_KECCAK256
}

asm( -> 0) extends fun loadCoins2(self: Slice): Int {
    LDVARUINT16
}

asm(c self) extends fun storeDict(self: Builder, c: Cell) {
    STDICT
}

asm(self len -> 0) extends fun loadInt2(self: Slice, len: Int): Int {
    LDIX
}

asm fun checkAndRemoveAddExtensionPrefix(s: Slice): Int {
    x{02} SDBEGINSQ
}

asm fun checkAndRemoveAddExtensionPrefix2() {
    -ROT
}

asm fun debugStr1() {
    "Works!" DEBUGSTR
}

asm fun debugStr2() { "Works!" }

asm fun createWord() {
    { INC }
}

/// Tests list and binding to a new regular word
asm fun createAndUseWord1(): Int {
    { INC } : incinc
    41 incinc
}

/// Tests weird formatting
asm fun createAndUseWord2(): Int { { INC
}
: incinc 41 incinc
}

/// Tests weird formatting
asm fun createAndUseWord3(): Int {
{
INC
}
:
incinc
41
incinc
}

/// Tests words with } inside of them
asm fun isIntAnInt(x: Int): Int {
    <{
        TRY:<{
            0 PUSHINT ADD DROP -1 PUSHINT
        }>CATCH<{
            2DROP 0 PUSHINT
        }>
    }>CONT 1 1 CALLXARGS
}

