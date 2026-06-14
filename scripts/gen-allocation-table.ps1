# Generates lib/engine/allocationTable.ts from the 495 slot strings extracted from
# https://en.wikipedia.org/wiki/Template:2026_FIFA_World_Cup_third-place_table
#
# Each 8-char slot string encodes M74,M77,M79,M80,M81,M82,M85,M87 values.
# The correct group key is self-identifying: sort(slot values) = included groups.

$slots = @(
# Row 1-45 (exclude {A,B,*,*})
'EJIFHGLK','HGIDJFLK','EJIDHGLK','EJIDHFLK','EGIDJFLK',
'EGJDHFLK','EGIDHFLK','EGJDHFLI','EGJDHFIK','HGICJFLK',
'EJICHGLK','EJICHFLK','EGICJFLK','EGJCHFLK','EGICHFLK',
'EGJCHFLI','EGJCHFIK','HGICJDLK','CJIDHFLK','CGIDJFLK',
'CGJDHFLK','CGIDHFLK','CGJDHFLI','CGJDHFIK','EJICHDLK',
'EGICJDLK','EGJCHDLK','EGICHDLK','EGJCHDLI','EGJCHDIK',
'CJEDIFLK','CJEDHFLK','CEIDHFLK','CJEDHFLI','CJEDHFIK',
'CGEDJFLK','CGEDIFLK','CGEDJFLI','CGEDJFIK','CGEDHFLK',
'CGJDHFLE','CGJDHFEK','CGEDHFLI','CGEDHFIK','CGJDHFEI',
# Row 46-109 (exclude {A,C,*,*} mostly)
'HJBFIGLK','EJIBHGLK','EJBFIHLK','EJBFIGLK','EJBFHGLK',
'EGBFIHLK','EJBFHGLI','EJBFHGIK','HJBDIGLK','HJBDIFLK',
'IGBDJFLK','HGBDJFLK','HGBDIFLK','HGBDJFLI','HGBDJFIK',
'EJBDIHLK','EJBDIGLK','EJBDHGLK','EGBDIHLK','EJBDHGLI',
'EJBDHGIK','EJBDIFLK','EJBDHFLK','EIBDHFLK','EJBDHFLI',
'EJBDHFIK','EGBDJFLK','EGBDIFLK','EGBDJFLI','EGBDJFIK',
'EGBDHFLK','HGBDJFLE','HGBDJFEK','EGBDHFLI','EGBDHFIK',
'HGBDJFEI','HJBCIGLK','HJBCIFLK','IGBCJFLK','HGBCJFLK',
'HGBCIFLK','HGBCJFLI','HGBCJFIK','EJBCIHLK','EJBCIGLK',
'EJBCHGLK','EGBCIHLK','EJBCHGLI','EJBCHGIK','EJBCIFLK',
'EJBCHFLK','EIBCHFLK','EJBCHFLI','EJBCHFIK','EGBCJFLK',
'EGBCIFLK','EGBCJFLI','EGBCJFIK','EGBCHFLK','HGBCJFLE',
'HGBCJFEK','EGBCHFLI','EGBCHFIK','HGBCJFEI',
# Row 110-165
'HJBCIDLK','IGBCJDLK','HGBCJDLK','HGBCIDLK','HGBCJDLI',
'HGBCJDIK','CJBDIFLK','CJBDHFLK','CIBDHFLK','CJBDHFLI',
'CJBDHFIK','CGBDJFLK','CGBDIFLK','CGBDJFLI','CGBDJFIK',
'CGBDHFLK','CGBDHFLJ','HGBCJFDK','CGBDHFLI','CGBDHFIK',
'HGBCJFDI','EJBCIDLK','EJBCHDLK','EIBCHDLK','EJBCHDLI',
'EJBCHDIK','EGBCJDLK','EGBCIDLK','EGBCJDLI','EGBCJDIK',
'EGBCHDLK','HGBCJDLE','HGBCJDEK','EGBCHDLI','EGBCHDIK',
'HGBCJDEI','CJBDEFLK','CEBDIFLK','CJBDEFLI','CJBDEFIK',
'CEBDHFLK','CJBDHFLE','CJBDHFEK','CEBDHFLI','CEBDHFIK',
'CJBDHFEI','CGBDEFLK','CGBDJFLE','CGBDJFEK','CGBDEFLI',
'CGBDEFIK','CGBDJFEI','CGBDHFLE','CGBDHFEK','HGBCJFDE',
'CGBDHFEI',
# Row 166-201 (exclude {A,*,*,*} groups, no B)
'HJIFAGLK','EJIAHGLK','EJIFAHLK','EJIFAGLK','EGJFAHLK',
'EGIFAHLK','EGJFAHLI','EGJFAHIK','HJIDAGLK','HJIDAFLK',
'IGJDAFLK','HGJDAFLK','HGIDAFLK','HGJDAFLI','HGJDAFIK',
'EJIDAHLK','EJIDAGLK','EGJDAHLK','EGIDAHLK','EGJDAHLI',
'EGJDAHIK','EJIDAFLK','HJEDAFLK','HEIDAFLK','HJEDAFLI',
'HJEDAFIK','EGJDAFLK','EGIDAFLK','EGJDAFLI','EGJDAFIK',
'HGEDAFLK','HGJDAFLE','HGJDAFEK','HGEDAFLI','HGEDAFIK',
'HGJDAFEI',
# Row 202-229
'HJICAGLK','HJICAFLK','IGJCAFLK','HGJCAFLK','HGICAFLK',
'HGJCAFLI','HGJCAFIK','EJICAHLK','EJICAGLK','EGJCAHLK',
'EGICAHLK','EGJCAHLI','EGJCAHIK','EJICAFLK','HJECAFLK',
'HEICAFLK','HJECAFLI','HJECAFIK','EGJCAFLK','EGICAFLK',
'EGJCAFLI','EGJCAFIK','HGECAFLK','HGJCAFLE','HGJCAFEK',
'HGECAFLI','HGECAFIK','HGJCAFEI',
# Row 230-285
'HJICADLK','IGJCADLK','HGJCADLK','HGICADLK','HGJCADLI',
'HGJCADIK','CJIDAFLK','HJFCADLK','HFICADLK','HJFCADLI',
'HJFCADIK','CGJDAFLK','CGIDAFLK','CGJDAFLI','CGJDAFIK',
'HGFCADLK','CGJDAFLH','HGJCAFDK','HGFCADLI','HGFCADIK',
'HGJCAFDI','EJICADLK','HJECADLK','HEICADLK','HJECADLI',
'HJECADIK','EGJCADLK','EGICADLK','EGJCADLI','EGJCADIK',
'HGECADLK','HGJCADLE','HGJCADEK','HGECADLI','HGECADIK',
'HGJCADEI','CJEDAFLK','CEIDAFLK','CJEDAFLI','CJEDAFIK',
'HEFCADLK','HJFCADLE','HJECAFDK','HEFCADLI','HEFCADIK',
'HJECAFDI','CGEDAFLK','CGJDAFLE','CGJDAFEK','CGEDAFLI',
'CGEDAFIK','CGJDAFEI','HGFCADLE','HGECAFDK','HGJCAFDE',
'HGECAFDI',
# Row 286-369 (exclude {B or start with AB...})
'HJBAIGLK','HJBAIFLK','IJBFAGLK','HJBFAGLK','HGBAIFLK',
'HJBFAGLI','HJBFAGIK','EJBAIHLK','EJBAIGLK','EJBAHGLK',
'EGBAIHLK','EJBAHGLI','EJBAHGIK','EJBAIFLK','EJBFAHLK',
'EIBFAHLK','EJBFAHLI','EJBFAHIK','EJBFAGLK','EGBAIFLK',
'EJBFAGLI','EJBFAGIK','EGBFAHLK','HJBFAGLE','HJBFAGEK',
'EGBFAHLI','EGBFAHIK','HJBFAGEI','IJBDAHLK','IJBDAGLK',
'HJBDAGLK','IGBDAHLK','HJBDAGLI','HJBDAGIK','IJBDAFLK',
'HJBDAFLK','HIBDAFLK','HJBDAFLI','HJBDAFIK','FJBDAGLK',
'IGBDAFLK','FJBDAGLI','FJBDAGIK','HGBDAFLK','HGBDAFLJ',
'HGBDAFJK','HGBDAFLI','HGBDAFIK','HGBDAFIJ','EJBAIDLK',
'EJBDAHLK','EIBDAHLK','EJBDAHLI','EJBDAHIK','EJBDAGLK',
'EGBAIDLK','EJBDAGLI','EJBDAGIK','EGBDAHLK','HJBDAGLE',
'HJBDAGEK','EGBDAHLI','EGBDAHIK','HJBDAGEI','EJBDAFLK',
'EIBDAFLK','EJBDAFLI','EJBDAFIK','HEBDAFLK','HJBDAFLE',
'HJBDAFEK','HEBDAFLI','HEBDAFIK','HJBDAFEI','EGBDAFLK',
'EGBDAFLJ','EGBDAFJK','EGBDAFLI','EGBDAFIK','EGBDAFIJ',
'HGBDAFLE','HGBDAFEK','HGBDAFEJ','HGBDAFEI',
# Row 370-425
'IJBCAHLK','IJBCAGLK','HJBCAGLK','IGBCAHLK','HJBCAGLI',
'HJBCAGIK','IJBCAFLK','HJBCAFLK','HIBCAFLK','HJBCAFLI',
'HJBCAFIK','CJBFAGLK','IGBCAFLK','CJBFAGLI','CJBFAGIK',
'HGBCAFLK','HGBCAFLJ','HGBCAFJK','HGBCAFLI','HGBCAFIK',
'HGBCAFIJ','EJBAICLK','EJBCAHLK','EIBCAHLK','EJBCAHLI',
'EJBCAHIK','EJBCAGLK','EGBAICLK','EJBCAGLI','EJBCAGIK',
'EGBCAHLK','HJBCAGLE','HJBCAGEK','EGBCAHLI','EGBCAHIK',
'HJBCAGEI','EJBCAFLK','EIBCAFLK','EJBCAFLI','EJBCAFIK',
'HEBCAFLK','HJBCAFLE','HJBCAFEK','HEBCAFLI','HEBCAFIK',
'HJBCAFEI','EGBCAFLK','EGBCAFLJ','EGBCAFJK','EGBCAFLI',
'EGBCAFIK','EGBCAFIJ','HGBCAFLE','HGBCAFEK','HGBCAFEJ',
'HGBCAFEI',
# Row 426-495
'IJBCADLK','HJBCADLK','HIBCADLK','HJBCADLI','HJBCADIK',
'CJBDAGLK','IGBCADLK','CJBDAGLI','CJBDAGIK','HGBCADLK',
'HGBCADLJ','HGBCADJK','HGBCADLI','HGBCADIK','HGBCADIJ',
'CJBDAFLK','CIBDAFLK','CJBDAFLI','CJBDAFIK','HFBCADLK',
'CJBDAFLH','HJBCAFDK','HFBCADLI','HFBCADIK','HJBCAFDI',
'CGBDAFLK','CGBDAFLJ','CGBDAFJK','CGBDAFLI','CGBDAFIK',
'CGBDAFIJ','CGBDAFLH','HGBCAFDK','HGBCAFDJ','HGBCAFDI',
'EJBCADLK','EIBCADLK','EJBCADLI','EJBCADIK','HEBCADLK',
'HJBCADLE','HJBCADEK','HEBCADLI','HEBCADIK','HJBCADEI',
'EGBCADLK','EGBCADLJ','EGBCADJK','EGBCADLI','EGBCADIK',
'EGBCADIJ','HGBCADLE','HGBCADEK','HGBCADEJ','HGBCADEI',
'CEBDAFLK','CJBDAFLE','CJBDAFEK','CEBDAFLI','CEBDAFIK',
'CJBDAFEI','HFBCADLE','HEBCAFDK','HJBCAFDE','HEBCAFDI',
'CGBDAFLE','CGBDAFEK','CGBDAFEJ','CGBDAFEI','HGBCAFDE'
)

Write-Output "Slot count: $($slots.Count)"

# Generate all 495 correct keys (to check completeness)
$groups = 'A','B','C','D','E','F','G','H','I','J','K','L'
$correctKeys = @()
for ($i = 0; $i -lt 12; $i++) {
    for ($j = ($i+1); $j -lt 12; $j++) {
        for ($m = ($j+1); $m -lt 12; $m++) {
            for ($p = ($m+1); $p -lt 12; $p++) {
                $excl = @($i,$j,$m,$p)
                $correctKeys += (0..11 | Where-Object { $_ -notin $excl } | ForEach-Object { $groups[$_] }) -join ''
            }
        }
    }
}

# Derive table entries from slot strings
$table = @{}
$dupes = @()
$invalidSlots = @()

for ($r = 0; $r -lt $slots.Count; $r++) {
    $s = $slots[$r]
    if ($s.Length -ne 8) { $invalidSlots += "Row $($r+1): '$s' has wrong length"; continue }
    $chars = $s.ToCharArray()
    # Validate all chars are valid group letters A-L
    $valid = $true
    foreach ($c in $chars) { if ('ABCDEFGHIJKL'.IndexOf($c) -lt 0) { $valid = $false; break } }
    if (-not $valid) { $invalidSlots += "Row $($r+1): '$s' has invalid chars"; continue }
    $key = ($chars | Sort-Object) -join ''
    if ($table.ContainsKey($key)) { $dupes += "Row $($r+1): derived key $key already exists (dupe of earlier row)" }
    else { $table[$key] = $s }
}

Write-Output "Unique entries: $($table.Count)"
Write-Output "Duplicates: $($dupes.Count)"
if ($dupes.Count -gt 0) { $dupes | ForEach-Object { Write-Output "  $_" } }
Write-Output "Invalid slots: $($invalidSlots.Count)"
if ($invalidSlots.Count -gt 0) { $invalidSlots | ForEach-Object { Write-Output "  $_" } }

$missing = $correctKeys | Where-Object { -not $table.ContainsKey($_) }
Write-Output "Missing keys: $($missing.Count)"
if ($missing.Count -gt 0) { $missing | ForEach-Object { Write-Output "  $_" } }

if ($table.Count -eq 495 -and $missing.Count -eq 0) {
    # Generate TypeScript file
    $matchSlots = 'M74','M77','M79','M80','M81','M82','M85','M87'
    $lines = @()
    $lines += '// FIFA 2026 World Cup — Round of 32 third-place team allocation table (Annex C).'
    $lines += '//'
    $lines += '// Source: FIFA World Cup 2026 Competition Regulations, Annex C.'
    $lines += '// Wikipedia mirror: https://en.wikipedia.org/wiki/Template:2026_FIFA_World_Cup_third-place_table'
    $lines += '//'
    $lines += '// 495 entries covering all C(12,8) combinations of qualifying third-place groups.'
    $lines += '// Key: sorted 8-group string. Value: assignment of each group to a specific R32 slot.'
    $lines += ''
    $lines += "import type { GroupId } from '@/lib/types';"
    $lines += ''
    $lines += "export type MatchSlot = 'M74' | 'M77' | 'M79' | 'M80' | 'M81' | 'M82' | 'M85' | 'M87';"
    $lines += 'export type ThirdAllocation = Record<MatchSlot, GroupId>;'
    $lines += ''
    $lines += 'export function allocationKey(groups: GroupId[]): string {'
    $lines += '  return [...groups].sort().join('''');'
    $lines += '}'
    $lines += ''
    $lines += 'const TABLE: Record<string, ThirdAllocation> = {'
    foreach ($key in ($correctKeys)) {
        $s = $table[$key]
        $parts = for ($i = 0; $i -lt 8; $i++) {
            "$($matchSlots[$i]): '$($s[$i])'"
        }
        $lines += "  $key`: { $($parts -join ', ') },"
    }
    $lines += '};'
    $lines += ''
    $lines += 'export function getAllocation(qualifyingGroups: GroupId[]): ThirdAllocation | null {'
    $lines += '  const key = allocationKey(qualifyingGroups);'
    $lines += '  return TABLE[key] ?? null;'
    $lines += '}'
    $lines += ''
    $lines += 'export function isAllocationComplete(): boolean {'
    $lines += '  return Object.keys(TABLE).length === 495;'
    $lines += '}'
    $lines += ''

    $outPath = Join-Path $PSScriptRoot '..\lib\engine\allocationTable.ts'
    $lines | Set-Content -Path $outPath -Encoding UTF8
    Write-Output "Written to $outPath"
}
