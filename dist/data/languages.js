const languages = [
    {
        language: "ab",
        name: "Abkhazian"
    },
    {
        language: "ace",
        name: "Achinese"
    },
    {
        language: "ach",
        name: "Acoli"
    },
    {
        language: "ada",
        name: "Adangme"
    },
    {
        language: "ady",
        name: "Adyghe"
    },
    {
        language: "aa",
        name: "Afar"
    },
    {
        language: "afh",
        name: "Afrihili"
    },
    {
        language: "af",
        name: "Afrikaans"
    },
    {
        language: "agq",
        name: "Aghem"
    },
    {
        language: "ain",
        name: "Ainu"
    },
    {
        language: "ak",
        name: "Akan"
    },
    {
        language: "akk",
        name: "Akkadian"
    },
    {
        language: "bss",
        name: "Akoose"
    },
    {
        language: "akz",
        name: "Alabama"
    },
    {
        language: "sq",
        name: "Albanian"
    },
    {
        language: "ale",
        name: "Aleut"
    },
    {
        language: "arq",
        name: "Algerian Arabic"
    },
    {
        language: "en_US",
        name: "American English"
    },
    {
        language: "ase",
        name: "American Sign Language"
    },
    {
        language: "am",
        name: "Amharic"
    },
    {
        language: "egy",
        name: "Ancient Egyptian"
    },
    {
        language: "grc",
        name: "Ancient Greek"
    },
    {
        language: "anp",
        name: "Angika"
    },
    {
        language: "njo",
        name: "Ao Naga"
    },
    {
        language: "ar",
        name: "Arabic"
    },
    {
        language: "an",
        name: "Aragonese"
    },
    {
        language: "arc",
        name: "Aramaic"
    },
    {
        language: "aro",
        name: "Araona"
    },
    {
        language: "arp",
        name: "Arapaho"
    },
    {
        language: "arw",
        name: "Arawak"
    },
    {
        language: "hy",
        name: "Armenian"
    },
    {
        language: "rup",
        name: "Aromanian"
    },
    {
        language: "frp",
        name: "Arpitan"
    },
    {
        language: "as",
        name: "Assamese"
    },
    {
        language: "ast",
        name: "Asturian"
    },
    {
        language: "asa",
        name: "Asu"
    },
    {
        language: "cch",
        name: "Atsam"
    },
    {
        language: "en_AU",
        name: "Australian English"
    },
    {
        language: "de_AT",
        name: "Austrian German"
    },
    {
        language: "av",
        name: "Avaric"
    },
    {
        language: "ae",
        name: "Avestan"
    },
    {
        language: "awa",
        name: "Awadhi"
    },
    {
        language: "ay",
        name: "Aymara"
    },
    {
        language: "az",
        name: "Azerbaijani"
    },
    {
        language: "bfq",
        name: "Badaga"
    },
    {
        language: "ksf",
        name: "Bafia"
    },
    {
        language: "bfd",
        name: "Bafut"
    },
    {
        language: "bqi",
        name: "Bakhtiari"
    },
    {
        language: "ban",
        name: "Balinese"
    },
    {
        language: "bal",
        name: "Baluchi"
    },
    {
        language: "bm",
        name: "Bambara"
    },
    {
        language: "bax",
        name: "Bamun"
    },
    {
        language: "bjn",
        name: "Banjar"
    },
    {
        language: "bas",
        name: "Basaa"
    },
    {
        language: "ba",
        name: "Bashkir"
    },
    {
        language: "eu",
        name: "Basque"
    },
    {
        language: "bbc",
        name: "Batak Toba"
    },
    {
        language: "bar",
        name: "Bavarian"
    },
    {
        language: "bej",
        name: "Beja"
    },
    {
        language: "be",
        name: "Belarusian"
    },
    {
        language: "bem",
        name: "Bemba"
    },
    {
        language: "bez",
        name: "Bena"
    },
    {
        language: "bn",
        name: "Bengali"
    },
    {
        language: "bew",
        name: "Betawi"
    },
    {
        language: "bho",
        name: "Bhojpuri"
    },
    {
        language: "bik",
        name: "Bikol"
    },
    {
        language: "bin",
        name: "Bini"
    },
    {
        language: "bpy",
        name: "Bishnupriya"
    },
    {
        language: "bi",
        name: "Bislama"
    },
    {
        language: "byn",
        name: "Blin"
    },
    {
        language: "zbl",
        name: "Blissymbols"
    },
    {
        language: "brx",
        name: "Bodo"
    },
    {
        language: "bs",
        name: "Bosnian"
    },
    {
        language: "brh",
        name: "Brahui"
    },
    {
        language: "bra",
        name: "Braj"
    },
    {
        language: "pt_BR",
        name: "Brazilian Portuguese"
    },
    {
        language: "br",
        name: "Breton"
    },
    {
        language: "en_GB",
        name: "British English"
    },
    {
        language: "bug",
        name: "Buginese"
    },
    {
        language: "bg",
        name: "Bulgarian"
    },
    {
        language: "bum",
        name: "Bulu"
    },
    {
        language: "bua",
        name: "Buriat"
    },
    {
        language: "my",
        name: "Burmese"
    },
    {
        language: "cad",
        name: "Caddo"
    },
    {
        language: "frc",
        name: "Cajun French"
    },
    {
        language: "en_CA",
        name: "Canadian English"
    },
    {
        language: "fr_CA",
        name: "Canadian French"
    },
    {
        language: "yue",
        name: "Cantonese"
    },
    {
        language: "cps",
        name: "Capiznon"
    },
    {
        language: "car",
        name: "Carib"
    },
    {
        language: "ca",
        name: "Catalan"
    },
    {
        language: "cay",
        name: "Cayuga"
    },
    {
        language: "ceb",
        name: "Cebuano"
    },
    {
        language: "tzm",
        name: "Central Atlas Tamazight"
    },
    {
        language: "dtp",
        name: "Central Dusun"
    },
    {
        language: "ckb",
        name: "Central Kurdish"
    },
    {
        language: "esu",
        name: "Central Yupik"
    },
    {
        language: "shu",
        name: "Chadian Arabic"
    },
    {
        language: "chg",
        name: "Chagatai"
    },
    {
        language: "ch",
        name: "Chamorro"
    },
    {
        language: "ce",
        name: "Chechen"
    },
    {
        language: "chr",
        name: "Cherokee"
    },
    {
        language: "chy",
        name: "Cheyenne"
    },
    {
        language: "chb",
        name: "Chibcha"
    },
    {
        language: "cgg",
        name: "Chiga"
    },
    {
        language: "qug",
        name: "Chimborazo Highland Quichua"
    },
    {
        language: "zh",
        name: "Chinese"
    },
    {
        language: "chn",
        name: "Chinook Jargon"
    },
    {
        language: "chp",
        name: "Chipewyan"
    },
    {
        language: "cho",
        name: "Choctaw"
    },
    {
        language: "cu",
        name: "Church Slavic"
    },
    {
        language: "chk",
        name: "Chuukese"
    },
    {
        language: "cv",
        name: "Chuvash"
    },
    {
        language: "nwc",
        name: "Classical Newari"
    },
    {
        language: "syc",
        name: "Classical Syriac"
    },
    {
        language: "ksh",
        name: "Colognian"
    },
    {
        language: "swb",
        name: "Comorian"
    },
    {
        language: "swc",
        name: "Congo Swahili"
    },
    {
        language: "cop",
        name: "Coptic"
    },
    {
        language: "kw",
        name: "Cornish"
    },
    {
        language: "co",
        name: "Corsican"
    },
    {
        language: "cr",
        name: "Cree"
    },
    {
        language: "mus",
        name: "Creek"
    },
    {
        language: "crh",
        name: "Crimean Turkish"
    },
    {
        language: "hr",
        name: "Croatian"
    },
    {
        language: "cs",
        name: "Czech"
    },
    {
        language: "dak",
        name: "Dakota"
    },
    {
        language: "da",
        name: "Danish"
    },
    {
        language: "dar",
        name: "Dargwa"
    },
    {
        language: "dzg",
        name: "Dazaga"
    },
    {
        language: "del",
        name: "Delaware"
    },
    {
        language: "din",
        name: "Dinka"
    },
    {
        language: "dv",
        name: "Divehi"
    },
    {
        language: "doi",
        name: "Dogri"
    },
    {
        language: "dgr",
        name: "Dogrib"
    },
    {
        language: "dua",
        name: "Duala"
    },
    {
        language: "nl",
        name: "Dutch"
    },
    {
        language: "dyu",
        name: "Dyula"
    },
    {
        language: "dz",
        name: "Dzongkha"
    },
    {
        language: "frs",
        name: "Eastern Frisian"
    },
    {
        language: "efi",
        name: "Efik"
    },
    {
        language: "arz",
        name: "Egyptian Arabic"
    },
    {
        language: "eka",
        name: "Ekajuk"
    },
    {
        language: "elx",
        name: "Elamite"
    },
    {
        language: "ebu",
        name: "Embu"
    },
    {
        language: "egl",
        name: "Emilian"
    },
    {
        language: "en",
        name: "English"
    },
    {
        language: "myv",
        name: "Erzya"
    },
    {
        language: "eo",
        name: "Esperanto"
    },
    {
        language: "et",
        name: "Estonian"
    },
    {
        language: "pt_PT",
        name: "European Portuguese"
    },
    {
        language: "es_ES",
        name: "European Spanish"
    },
    {
        language: "ee",
        name: "Ewe"
    },
    {
        language: "ewo",
        name: "Ewondo"
    },
    {
        language: "ext",
        name: "Extremaduran"
    },
    {
        language: "fan",
        name: "Fang"
    },
    {
        language: "fat",
        name: "Fanti"
    },
    {
        language: "fo",
        name: "Faroese"
    },
    {
        language: "hif",
        name: "Fiji Hindi"
    },
    {
        language: "fj",
        name: "Fijian"
    },
    {
        language: "fil",
        name: "Filipino"
    },
    {
        language: "fi",
        name: "Finnish"
    },
    {
        language: "nl_BE",
        name: "Flemish"
    },
    {
        language: "fon",
        name: "Fon"
    },
    {
        language: "gur",
        name: "Frafra"
    },
    {
        language: "fr",
        name: "French"
    },
    {
        language: "fur",
        name: "Friulian"
    },
    {
        language: "ff",
        name: "Fulah"
    },
    {
        language: "gaa",
        name: "Ga"
    },
    {
        language: "gag",
        name: "Gagauz"
    },
    {
        language: "gl",
        name: "Galician"
    },
    {
        language: "gan",
        name: "Gan Chinese"
    },
    {
        language: "lg",
        name: "Ganda"
    },
    {
        language: "gay",
        name: "Gayo"
    },
    {
        language: "gba",
        name: "Gbaya"
    },
    {
        language: "gez",
        name: "Geez"
    },
    {
        language: "ka",
        name: "Georgian"
    },
    {
        language: "de",
        name: "German"
    },
    {
        language: "aln",
        name: "Gheg Albanian"
    },
    {
        language: "bbj",
        name: "Ghomala"
    },
    {
        language: "glk",
        name: "Gilaki"
    },
    {
        language: "gil",
        name: "Gilbertese"
    },
    {
        language: "gom",
        name: "Goan Konkani"
    },
    {
        language: "gon",
        name: "Gondi"
    },
    {
        language: "gor",
        name: "Gorontalo"
    },
    {
        language: "got",
        name: "Gothic"
    },
    {
        language: "grb",
        name: "Grebo"
    },
    {
        language: "el",
        name: "Greek"
    },
    {
        language: "gn",
        name: "Guarani"
    },
    {
        language: "gu",
        name: "Gujarati"
    },
    {
        language: "guz",
        name: "Gusii"
    },
    {
        language: "gwi",
        name: "Gwichʼin"
    },
    {
        language: "hai",
        name: "Haida"
    },
    {
        language: "ht",
        name: "Haitian"
    },
    {
        language: "hak",
        name: "Hakka Chinese"
    },
    {
        language: "ha",
        name: "Hausa"
    },
    {
        language: "haw",
        name: "Hawaiian"
    },
    {
        language: "he",
        name: "Hebrew"
    },
    {
        language: "hz",
        name: "Herero"
    },
    {
        language: "hil",
        name: "Hiligaynon"
    },
    {
        language: "hi",
        name: "Hindi"
    },
    {
        language: "ho",
        name: "Hiri Motu"
    },
    {
        language: "hit",
        name: "Hittite"
    },
    {
        language: "hmn",
        name: "Hmong"
    },
    {
        language: "hu",
        name: "Hungarian"
    },
    {
        language: "hup",
        name: "Hupa"
    },
    {
        language: "iba",
        name: "Iban"
    },
    {
        language: "ibb",
        name: "Ibibio"
    },
    {
        language: "is",
        name: "Icelandic"
    },
    {
        language: "io",
        name: "Ido"
    },
    {
        language: "ig",
        name: "Igbo"
    },
    {
        language: "ilo",
        name: "Iloko"
    },
    {
        language: "smn",
        name: "Inari Sami"
    },
    {
        language: "id",
        name: "Indonesian"
    },
    {
        language: "izh",
        name: "Ingrian"
    },
    {
        language: "inh",
        name: "Ingush"
    },
    {
        language: "ia",
        name: "Interlingua"
    },
    {
        language: "ie",
        name: "Interlingue"
    },
    {
        language: "iu",
        name: "Inuktitut"
    },
    {
        language: "ik",
        name: "Inupiaq"
    },
    {
        language: "ga",
        name: "Irish"
    },
    {
        language: "it",
        name: "Italian"
    },
    {
        language: "jam",
        name: "Jamaican Creole English"
    },
    {
        language: "ja",
        name: "Japanese"
    },
    {
        language: "jv",
        name: "Javanese"
    },
    {
        language: "kaj",
        name: "Jju"
    },
    {
        language: "dyo",
        name: "Jola-Fonyi"
    },
    {
        language: "jrb",
        name: "Judeo-Arabic"
    },
    {
        language: "jpr",
        name: "Judeo-Persian"
    },
    {
        language: "jut",
        name: "Jutish"
    },
    {
        language: "kbd",
        name: "Kabardian"
    },
    {
        language: "kea",
        name: "Kabuverdianu"
    },
    {
        language: "kab",
        name: "Kabyle"
    },
    {
        language: "kac",
        name: "Kachin"
    },
    {
        language: "kgp",
        name: "Kaingang"
    },
    {
        language: "kkj",
        name: "Kako"
    },
    {
        language: "kl",
        name: "Kalaallisut"
    },
    {
        language: "kln",
        name: "Kalenjin"
    },
    {
        language: "xal",
        name: "Kalmyk"
    },
    {
        language: "kam",
        name: "Kamba"
    },
    {
        language: "kbl",
        name: "Kanembu"
    },
    {
        language: "kn",
        name: "Kannada"
    },
    {
        language: "kr",
        name: "Kanuri"
    },
    {
        language: "kaa",
        name: "Kara-Kalpak"
    },
    {
        language: "krc",
        name: "Karachay-Balkar"
    },
    {
        language: "krl",
        name: "Karelian"
    },
    {
        language: "ks",
        name: "Kashmiri"
    },
    {
        language: "csb",
        name: "Kashubian"
    },
    {
        language: "kaw",
        name: "Kawi"
    },
    {
        language: "kk",
        name: "Kazakh"
    },
    {
        language: "ken",
        name: "Kenyang"
    },
    {
        language: "kha",
        name: "Khasi"
    },
    {
        language: "km",
        name: "Khmer"
    },
    {
        language: "kho",
        name: "Khotanese"
    },
    {
        language: "khw",
        name: "Khowar"
    },
    {
        language: "ki",
        name: "Kikuyu"
    },
    {
        language: "kmb",
        name: "Kimbundu"
    },
    {
        language: "krj",
        name: "Kinaray-a"
    },
    {
        language: "rw",
        name: "Kinyarwanda"
    },
    {
        language: "kiu",
        name: "Kirmanjki"
    },
    {
        language: "tlh",
        name: "Klingon"
    },
    {
        language: "bkm",
        name: "Kom"
    },
    {
        language: "kv",
        name: "Komi"
    },
    {
        language: "koi",
        name: "Komi-Permyak"
    },
    {
        language: "kg",
        name: "Kongo"
    },
    {
        language: "kok",
        name: "Konkani"
    },
    {
        language: "ko",
        name: "Korean"
    },
    {
        language: "kfo",
        name: "Koro"
    },
    {
        language: "kos",
        name: "Kosraean"
    },
    {
        language: "avk",
        name: "Kotava"
    },
    {
        language: "khq",
        name: "Koyra Chiini"
    },
    {
        language: "ses",
        name: "Koyraboro Senni"
    },
    {
        language: "kpe",
        name: "Kpelle"
    },
    {
        language: "kri",
        name: "Krio"
    },
    {
        language: "kj",
        name: "Kuanyama"
    },
    {
        language: "kum",
        name: "Kumyk"
    },
    {
        language: "ku",
        name: "Kurdish"
    },
    {
        language: "kru",
        name: "Kurukh"
    },
    {
        language: "kut",
        name: "Kutenai"
    },
    {
        language: "nmg",
        name: "Kwasio"
    },
    {
        language: "ky",
        name: "Kyrgyz"
    },
    {
        language: "quc",
        name: "Kʼicheʼ"
    },
    {
        language: "lad",
        name: "Ladino"
    },
    {
        language: "lah",
        name: "Lahnda"
    },
    {
        language: "lkt",
        name: "Lakota"
    },
    {
        language: "lam",
        name: "Lamba"
    },
    {
        language: "lag",
        name: "Langi"
    },
    {
        language: "lo",
        name: "Lao"
    },
    {
        language: "ltg",
        name: "Latgalian"
    },
    {
        language: "la",
        name: "Latin"
    },
    {
        language: "es_419",
        name: "Latin American Spanish"
    },
    {
        language: "lv",
        name: "Latvian"
    },
    {
        language: "lzz",
        name: "Laz"
    },
    {
        language: "lez",
        name: "Lezghian"
    },
    {
        language: "lij",
        name: "Ligurian"
    },
    {
        language: "li",
        name: "Limburgish"
    },
    {
        language: "ln",
        name: "Lingala"
    },
    {
        language: "lfn",
        name: "Lingua Franca Nova"
    },
    {
        language: "lzh",
        name: "Literary Chinese"
    },
    {
        language: "lt",
        name: "Lithuanian"
    },
    {
        language: "liv",
        name: "Livonian"
    },
    {
        language: "jbo",
        name: "Lojban"
    },
    {
        language: "lmo",
        name: "Lombard"
    },
    {
        language: "nds",
        name: "Low German"
    },
    {
        language: "sli",
        name: "Lower Silesian"
    },
    {
        language: "dsb",
        name: "Lower Sorbian"
    },
    {
        language: "loz",
        name: "Lozi"
    },
    {
        language: "lu",
        name: "Luba-Katanga"
    },
    {
        language: "lua",
        name: "Luba-Lulua"
    },
    {
        language: "lui",
        name: "Luiseno"
    },
    {
        language: "smj",
        name: "Lule Sami"
    },
    {
        language: "lun",
        name: "Lunda"
    },
    {
        language: "luo",
        name: "Luo"
    },
    {
        language: "lb",
        name: "Luxembourgish"
    },
    {
        language: "luy",
        name: "Luyia"
    },
    {
        language: "mde",
        name: "Maba"
    },
    {
        language: "mk",
        name: "Macedonian"
    },
    {
        language: "jmc",
        name: "Machame"
    },
    {
        language: "mad",
        name: "Madurese"
    },
    {
        language: "maf",
        name: "Mafa"
    },
    {
        language: "mag",
        name: "Magahi"
    },
    {
        language: "vmf",
        name: "Main-Franconian"
    },
    {
        language: "mai",
        name: "Maithili"
    },
    {
        language: "mak",
        name: "Makasar"
    },
    {
        language: "mgh",
        name: "Makhuwa-Meetto"
    },
    {
        language: "kde",
        name: "Makonde"
    },
    {
        language: "mg",
        name: "Malagasy"
    },
    {
        language: "ms",
        name: "Malay"
    },
    {
        language: "ml",
        name: "Malayalam"
    },
    {
        language: "mt",
        name: "Maltese"
    },
    {
        language: "mnc",
        name: "Manchu"
    },
    {
        language: "mdr",
        name: "Mandar"
    },
    {
        language: "man",
        name: "Mandingo"
    },
    {
        language: "mni",
        name: "Manipuri"
    },
    {
        language: "gv",
        name: "Manx"
    },
    {
        language: "mi",
        name: "Maori"
    },
    {
        language: "arn",
        name: "Mapuche"
    },
    {
        language: "mr",
        name: "Marathi"
    },
    {
        language: "chm",
        name: "Mari"
    },
    {
        language: "mh",
        name: "Marshallese"
    },
    {
        language: "mwr",
        name: "Marwari"
    },
    {
        language: "mas",
        name: "Masai"
    },
    {
        language: "mzn",
        name: "Mazanderani"
    },
    {
        language: "byv",
        name: "Medumba"
    },
    {
        language: "men",
        name: "Mende"
    },
    {
        language: "mwv",
        name: "Mentawai"
    },
    {
        language: "mer",
        name: "Meru"
    },
    {
        language: "mgo",
        name: "Metaʼ"
    },
    {
        language: "es_MX",
        name: "Mexican Spanish"
    },
    {
        language: "mic",
        name: "Micmac"
    },
    {
        language: "dum",
        name: "Middle Dutch"
    },
    {
        language: "enm",
        name: "Middle English"
    },
    {
        language: "frm",
        name: "Middle French"
    },
    {
        language: "gmh",
        name: "Middle High German"
    },
    {
        language: "mga",
        name: "Middle Irish"
    },
    {
        language: "nan",
        name: "Min Nan Chinese"
    },
    {
        language: "min",
        name: "Minangkabau"
    },
    {
        language: "xmf",
        name: "Mingrelian"
    },
    {
        language: "mwl",
        name: "Mirandese"
    },
    {
        language: "lus",
        name: "Mizo"
    },
    {
        language: "ar_001",
        name: "Modern Standard Arabic"
    },
    {
        language: "moh",
        name: "Mohawk"
    },
    {
        language: "mdf",
        name: "Moksha"
    },
    {
        language: "ro_MD",
        name: "Moldavian"
    },
    {
        language: "lol",
        name: "Mongo"
    },
    {
        language: "mn",
        name: "Mongolian"
    },
    {
        language: "mfe",
        name: "Morisyen"
    },
    {
        language: "ary",
        name: "Moroccan Arabic"
    },
    {
        language: "mos",
        name: "Mossi"
    },
    {
        language: "mul",
        name: "Multiple Languages"
    },
    {
        language: "mua",
        name: "Mundang"
    },
    {
        language: "ttt",
        name: "Muslim Tat"
    },
    {
        language: "mye",
        name: "Myene"
    },
    {
        language: "naq",
        name: "Nama"
    },
    {
        language: "na",
        name: "Nauru"
    },
    {
        language: "nv",
        name: "Navajo"
    },
    {
        language: "ng",
        name: "Ndonga"
    },
    {
        language: "nap",
        name: "Neapolitan"
    },
    {
        language: "ne",
        name: "Nepali"
    },
    {
        language: "new",
        name: "Newari"
    },
    {
        language: "sba",
        name: "Ngambay"
    },
    {
        language: "nnh",
        name: "Ngiemboon"
    },
    {
        language: "jgo",
        name: "Ngomba"
    },
    {
        language: "yrl",
        name: "Nheengatu"
    },
    {
        language: "nia",
        name: "Nias"
    },
    {
        language: "niu",
        name: "Niuean"
    },
    {
        language: "zxx",
        name: "No linguistic content"
    },
    {
        language: "nog",
        name: "Nogai"
    },
    {
        language: "nd",
        name: "North Ndebele"
    },
    {
        language: "frr",
        name: "Northern Frisian"
    },
    {
        language: "se",
        name: "Northern Sami"
    },
    {
        language: "nso",
        name: "Northern Sotho"
    },
    {
        language: "no",
        name: "Norwegian"
    },
    {
        language: "nb",
        name: "Norwegian Bokmål"
    },
    {
        language: "nn",
        name: "Norwegian Nynorsk"
    },
    {
        language: "nov",
        name: "Novial"
    },
    {
        language: "nus",
        name: "Nuer"
    },
    {
        language: "nym",
        name: "Nyamwezi"
    },
    {
        language: "ny",
        name: "Nyanja"
    },
    {
        language: "nyn",
        name: "Nyankole"
    },
    {
        language: "tog",
        name: "Nyasa Tonga"
    },
    {
        language: "nyo",
        name: "Nyoro"
    },
    {
        language: "nzi",
        name: "Nzima"
    },
    {
        language: "nqo",
        name: "NʼKo"
    },
    {
        language: "oc",
        name: "Occitan"
    },
    {
        language: "oj",
        name: "Ojibwa"
    },
    {
        language: "ang",
        name: "Old English"
    },
    {
        language: "fro",
        name: "Old French"
    },
    {
        language: "goh",
        name: "Old High German"
    },
    {
        language: "sga",
        name: "Old Irish"
    },
    {
        language: "non",
        name: "Old Norse"
    },
    {
        language: "peo",
        name: "Old Persian"
    },
    {
        language: "pro",
        name: "Old Provençal"
    },
    {
        language: "or",
        name: "Oriya"
    },
    {
        language: "om",
        name: "Oromo"
    },
    {
        language: "osa",
        name: "Osage"
    },
    {
        language: "os",
        name: "Ossetic"
    },
    {
        language: "ota",
        name: "Ottoman Turkish"
    },
    {
        language: "pal",
        name: "Pahlavi"
    },
    {
        language: "pfl",
        name: "Palatine German"
    },
    {
        language: "pau",
        name: "Palauan"
    },
    {
        language: "pi",
        name: "Pali"
    },
    {
        language: "pam",
        name: "Pampanga"
    },
    {
        language: "pag",
        name: "Pangasinan"
    },
    {
        language: "pap",
        name: "Papiamento"
    },
    {
        language: "ps",
        name: "Pashto"
    },
    {
        language: "pdc",
        name: "Pennsylvania German"
    },
    {
        language: "fa",
        name: "Persian"
    },
    {
        language: "phn",
        name: "Phoenician"
    },
    {
        language: "pcd",
        name: "Picard"
    },
    {
        language: "pms",
        name: "Piedmontese"
    },
    {
        language: "pdt",
        name: "Plautdietsch"
    },
    {
        language: "pon",
        name: "Pohnpeian"
    },
    {
        language: "pl",
        name: "Polish"
    },
    {
        language: "pnt",
        name: "Pontic"
    },
    {
        language: "pt",
        name: "Portuguese"
    },
    {
        language: "prg",
        name: "Prussian"
    },
    {
        language: "pa",
        name: "Punjabi"
    },
    {
        language: "qu",
        name: "Quechua"
    },
    {
        language: "raj",
        name: "Rajasthani"
    },
    {
        language: "rap",
        name: "Rapanui"
    },
    {
        language: "rar",
        name: "Rarotongan"
    },
    {
        language: "rif",
        name: "Riffian"
    },
    {
        language: "rgn",
        name: "Romagnol"
    },
    {
        language: "ro",
        name: "Romanian"
    },
    {
        language: "rm",
        name: "Romansh"
    },
    {
        language: "rom",
        name: "Romany"
    },
    {
        language: "rof",
        name: "Rombo"
    },
    {
        language: "root",
        name: "Root"
    },
    {
        language: "rtm",
        name: "Rotuman"
    },
    {
        language: "rug",
        name: "Roviana"
    },
    {
        language: "rn",
        name: "Rundi"
    },
    {
        language: "ru",
        name: "Russian"
    },
    {
        language: "rue",
        name: "Rusyn"
    },
    {
        language: "rwk",
        name: "Rwa"
    },
    {
        language: "ssy",
        name: "Saho"
    },
    {
        language: "sah",
        name: "Sakha"
    },
    {
        language: "sam",
        name: "Samaritan Aramaic"
    },
    {
        language: "saq",
        name: "Samburu"
    },
    {
        language: "sm",
        name: "Samoan"
    },
    {
        language: "sgs",
        name: "Samogitian"
    },
    {
        language: "sad",
        name: "Sandawe"
    },
    {
        language: "sg",
        name: "Sango"
    },
    {
        language: "sbp",
        name: "Sangu"
    },
    {
        language: "sa",
        name: "Sanskrit"
    },
    {
        language: "sat",
        name: "Santali"
    },
    {
        language: "sc",
        name: "Sardinian"
    },
    {
        language: "sas",
        name: "Sasak"
    },
    {
        language: "sdc",
        name: "Sassarese Sardinian"
    },
    {
        language: "stq",
        name: "Saterland Frisian"
    },
    {
        language: "saz",
        name: "Saurashtra"
    },
    {
        language: "sco",
        name: "Scots"
    },
    {
        language: "gd",
        name: "Scottish Gaelic"
    },
    {
        language: "sly",
        name: "Selayar"
    },
    {
        language: "sel",
        name: "Selkup"
    },
    {
        language: "seh",
        name: "Sena"
    },
    {
        language: "see",
        name: "Seneca"
    },
    {
        language: "sr",
        name: "Serbian"
    },
    {
        language: "sh",
        name: "Serbo-Croatian"
    },
    {
        language: "srr",
        name: "Serer"
    },
    {
        language: "sei",
        name: "Seri"
    },
    {
        language: "ksb",
        name: "Shambala"
    },
    {
        language: "shn",
        name: "Shan"
    },
    {
        language: "sn",
        name: "Shona"
    },
    {
        language: "ii",
        name: "Sichuan Yi"
    },
    {
        language: "scn",
        name: "Sicilian"
    },
    {
        language: "sid",
        name: "Sidamo"
    },
    {
        language: "bla",
        name: "Siksika"
    },
    {
        language: "szl",
        name: "Silesian"
    },
    {
        language: "zh_Hans",
        name: "Simplified Chinese"
    },
    {
        language: "sd",
        name: "Sindhi"
    },
    {
        language: "si",
        name: "Sinhala"
    },
    {
        language: "sms",
        name: "Skolt Sami"
    },
    {
        language: "den",
        name: "Slave"
    },
    {
        language: "sk",
        name: "Slovak"
    },
    {
        language: "sl",
        name: "Slovenian"
    },
    {
        language: "xog",
        name: "Soga"
    },
    {
        language: "sog",
        name: "Sogdien"
    },
    {
        language: "so",
        name: "Somali"
    },
    {
        language: "snk",
        name: "Soninke"
    },
    {
        language: "azb",
        name: "South Azerbaijani"
    },
    {
        language: "nr",
        name: "South Ndebele"
    },
    {
        language: "alt",
        name: "Southern Altai"
    },
    {
        language: "sma",
        name: "Southern Sami"
    },
    {
        language: "st",
        name: "Southern Sotho"
    },
    {
        language: "es",
        name: "Spanish"
    },
    {
        language: "srn",
        name: "Sranan Tongo"
    },
    {
        language: "zgh",
        name: "Standard Moroccan Tamazight"
    },
    {
        language: "suk",
        name: "Sukuma"
    },
    {
        language: "sux",
        name: "Sumerian"
    },
    {
        language: "su",
        name: "Sundanese"
    },
    {
        language: "sus",
        name: "Susu"
    },
    {
        language: "sw",
        name: "Swahili"
    },
    {
        language: "ss",
        name: "Swati"
    },
    {
        language: "sv",
        name: "Swedish"
    },
    {
        language: "fr_CH",
        name: "Swiss French"
    },
    {
        language: "gsw",
        name: "Swiss German"
    },
    {
        language: "de_CH",
        name: "Swiss High German"
    },
    {
        language: "syr",
        name: "Syriac"
    },
    {
        language: "shi",
        name: "Tachelhit"
    },
    {
        language: "tl",
        name: "Tagalog"
    },
    {
        language: "ty",
        name: "Tahitian"
    },
    {
        language: "dav",
        name: "Taita"
    },
    {
        language: "tg",
        name: "Tajik"
    },
    {
        language: "tly",
        name: "Talysh"
    },
    {
        language: "tmh",
        name: "Tamashek"
    },
    {
        language: "ta",
        name: "Tamil"
    },
    {
        language: "trv",
        name: "Taroko"
    },
    {
        language: "twq",
        name: "Tasawaq"
    },
    {
        language: "tt",
        name: "Tatar"
    },
    {
        language: "te",
        name: "Telugu"
    },
    {
        language: "ter",
        name: "Tereno"
    },
    {
        language: "teo",
        name: "Teso"
    },
    {
        language: "tet",
        name: "Tetum"
    },
    {
        language: "th",
        name: "Thai"
    },
    {
        language: "bo",
        name: "Tibetan"
    },
    {
        language: "tig",
        name: "Tigre"
    },
    {
        language: "ti",
        name: "Tigrinya"
    },
    {
        language: "tem",
        name: "Timne"
    },
    {
        language: "tiv",
        name: "Tiv"
    },
    {
        language: "tli",
        name: "Tlingit"
    },
    {
        language: "tpi",
        name: "Tok Pisin"
    },
    {
        language: "tkl",
        name: "Tokelau"
    },
    {
        language: "to",
        name: "Tongan"
    },
    {
        language: "fit",
        name: "Tornedalen Finnish"
    },
    {
        language: "zh_Hant",
        name: "Traditional Chinese"
    },
    {
        language: "tkr",
        name: "Tsakhur"
    },
    {
        language: "tsd",
        name: "Tsakonian"
    },
    {
        language: "tsi",
        name: "Tsimshian"
    },
    {
        language: "ts",
        name: "Tsonga"
    },
    {
        language: "tn",
        name: "Tswana"
    },
    {
        language: "tcy",
        name: "Tulu"
    },
    {
        language: "tum",
        name: "Tumbuka"
    },
    {
        language: "aeb",
        name: "Tunisian Arabic"
    },
    {
        language: "tr",
        name: "Turkish"
    },
    {
        language: "tk",
        name: "Turkmen"
    },
    {
        language: "tru",
        name: "Turoyo"
    },
    {
        language: "tvl",
        name: "Tuvalu"
    },
    {
        language: "tyv",
        name: "Tuvinian"
    },
    {
        language: "tw",
        name: "Twi"
    },
    {
        language: "kcg",
        name: "Tyap"
    },
    {
        language: "udm",
        name: "Udmurt"
    },
    {
        language: "uga",
        name: "Ugaritic"
    },
    {
        language: "uk",
        name: "Ukrainian"
    },
    {
        language: "umb",
        name: "Umbundu"
    },
    {
        language: "hsb",
        name: "Upper Sorbian"
    },
    {
        language: "ur",
        name: "Urdu"
    },
    {
        language: "ug",
        name: "Uyghur"
    },
    {
        language: "uz",
        name: "Uzbek"
    },
    {
        language: "vai",
        name: "Vai"
    },
    {
        language: "ve",
        name: "Venda"
    },
    {
        language: "vec",
        name: "Venetian"
    },
    {
        language: "vep",
        name: "Veps"
    },
    {
        language: "vi",
        name: "Vietnamese"
    },
    {
        language: "vo",
        name: "Volapük"
    },
    {
        language: "vro",
        name: "Võro"
    },
    {
        language: "vot",
        name: "Votic"
    },
    {
        language: "vun",
        name: "Vunjo"
    },
    {
        language: "wa",
        name: "Walloon"
    },
    {
        language: "wae",
        name: "Walser"
    },
    {
        language: "war",
        name: "Waray"
    },
    {
        language: "wbp",
        name: "Warlpiri"
    },
    {
        language: "was",
        name: "Washo"
    },
    {
        language: "guc",
        name: "Wayuu"
    },
    {
        language: "cy",
        name: "Welsh"
    },
    {
        language: "vls",
        name: "West Flemish"
    },
    {
        language: "fy",
        name: "Western Frisian"
    },
    {
        language: "mrj",
        name: "Western Mari"
    },
    {
        language: "wal",
        name: "Wolaytta"
    },
    {
        language: "wo",
        name: "Wolof"
    },
    {
        language: "wuu",
        name: "Wu Chinese"
    },
    {
        language: "xh",
        name: "Xhosa"
    },
    {
        language: "hsn",
        name: "Xiang Chinese"
    },
    {
        language: "yav",
        name: "Yangben"
    },
    {
        language: "yao",
        name: "Yao"
    },
    {
        language: "yap",
        name: "Yapese"
    },
    {
        language: "ybb",
        name: "Yemba"
    },
    {
        language: "yi",
        name: "Yiddish"
    },
    {
        language: "yo",
        name: "Yoruba"
    },
    {
        language: "zap",
        name: "Zapotec"
    },
    {
        language: "dje",
        name: "Zarma"
    },
    {
        language: "zza",
        name: "Zaza"
    },
    {
        language: "zea",
        name: "Zeelandic"
    },
    {
        language: "zen",
        name: "Zenaga"
    },
    {
        language: "za",
        name: "Zhuang"
    },
    {
        language: "gbz",
        name: "Zoroastrian Dari"
    },
    {
        language: "zu",
        name: "Zulu"
    },
    {
        language: "zun",
        name: "Zuni"
    }
];
export const languageMap = Object.fromEntries(languages.map(({ language, name }) => [language, name]));
