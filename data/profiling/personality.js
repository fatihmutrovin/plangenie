const fs = require("fs");
const path = require("path");

const personalityMapping =
JSON.parse(

    fs.readFileSync(

        path.join(
            __dirname,
            "../personality/personality-mapping.json"
        ),

        "utf8"

    )

);

function getFinancialPersonality(

    lifestyle,
    savingHabit,
    investmentExperience,
    expenseFocus

){

    console.log(
        "PERSONALITY INPUT:",
        {
            lifestyle,
            savingHabit,
            investmentExperience,
            expenseFocus
        }
    );

    const result =
    personalityMapping.find(item =>

        item.lifestyle.toLowerCase() ===
        lifestyle.toLowerCase()

        &&

        item.savingHabit.toLowerCase() ===
        savingHabit.toLowerCase()

        &&

        item.investmentExperience.toLowerCase() ===
        investmentExperience.toLowerCase()

        &&

        item.expenseFocus.toLowerCase() ===
        expenseFocus.toLowerCase()

    );

    if(result){

        console.log(
            "PERSONALITY FOUND:",
            result.personality
        );

        return result.personality;

    }

    console.log(
        "PERSONALITY DEFAULT USED"
    );

    return "Balanced Financial User";

}

module.exports = {
    getFinancialPersonality
};