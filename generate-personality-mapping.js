const fs = require("fs");

const personalityData = [

    {
        lifestyle: "Hemat",
        savingHabit: "Rutin",
        investmentExperience: "Belum",
        expenseFocus: "Kebutuhan_pokok",
        personality: "Compulsive Saver"
    },

    {
        lifestyle: "Hemat",
        savingHabit: "Rutin",
        investmentExperience: "Belum",
        expenseFocus: "Gaya_hidup",
        personality: "Compulsive Saver"
    }

    // dst sampai 81
];

fs.writeFileSync(
    "./data/personality/personality-mapping.json",
    JSON.stringify(
        personalityData,
        null,
        4
    )
);

console.log(
    "personality-mapping.json berhasil dibuat"
);